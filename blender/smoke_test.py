"""Headless bpy smoke test: builds a tiny scene and renders one 1080p frame.

Usage:
    .venv/bin/python smoke_test.py --engine cycles --samples 32 --out renders/cycles.png
    .venv/bin/python smoke_test.py --engine eevee --out renders/eevee.png
"""

import argparse
import math
import sys
import time
from pathlib import Path

import bpy

ENGINES = {"eevee": "BLENDER_EEVEE", "cycles": "CYCLES", "workbench": "BLENDER_WORKBENCH"}


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser()
    p.add_argument("--engine", choices=sorted(ENGINES), default="cycles")
    p.add_argument("--samples", type=int, default=32)
    p.add_argument("--no-denoise", action="store_true")
    p.add_argument("--width", type=int, default=1920)
    p.add_argument("--height", type=int, default=1080)
    p.add_argument("--threads", type=int, default=0, help="0 = auto")
    p.add_argument("--out", default="renders/smoke.png")
    return p.parse_args()


def build_scene() -> bpy.types.Scene:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene

    # World: flat dark-blue background that also lights the scene a little.
    world = bpy.data.worlds.new("World")
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.02, 0.03, 0.08, 1.0)
    bg.inputs["Strength"].default_value = 1.0
    scene.world = world

    # Ground plane (diffuse).
    bpy.ops.mesh.primitive_plane_add(size=20, location=(0, 0, 0))
    plane = bpy.context.active_object
    mat_plane = bpy.data.materials.new("Ground")
    bsdf = mat_plane.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.35, 0.33, 0.30, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.6
    plane.data.materials.append(mat_plane)

    # Emissive sphere.
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, location=(0, 0, 1.0), segments=64, ring_count=32)
    sphere = bpy.context.active_object
    bpy.ops.object.shade_smooth()
    mat_glow = bpy.data.materials.new("Glow")
    nodes = mat_glow.node_tree.nodes
    nodes.remove(nodes["Principled BSDF"])
    emit = nodes.new("ShaderNodeEmission")
    emit.inputs["Color"].default_value = (1.0, 0.55, 0.2, 1.0)
    emit.inputs["Strength"].default_value = 8.0
    mat_glow.node_tree.links.new(emit.outputs["Emission"], nodes["Material Output"].inputs["Surface"])
    sphere.data.materials.append(mat_glow)

    # Second, non-emissive object so shadows/reflections are visible.
    bpy.ops.mesh.primitive_cube_add(size=1.2, location=(2.4, 0.8, 0.6), rotation=(0, 0, math.radians(30)))
    cube = bpy.context.active_object
    mat_cube = bpy.data.materials.new("Cube")
    cb = mat_cube.node_tree.nodes["Principled BSDF"]
    cb.inputs["Base Color"].default_value = (0.2, 0.4, 0.8, 1.0)
    cb.inputs["Roughness"].default_value = 0.3
    cube.data.materials.append(mat_cube)

    # Soft key light.
    bpy.ops.object.light_add(type="AREA", location=(-3, -3, 5))
    light = bpy.context.active_object
    light.data.energy = 300
    light.data.size = 3
    light.rotation_euler = (math.radians(35), 0, math.radians(-45))

    # Camera looking at the sphere.
    bpy.ops.object.camera_add(location=(0, -7.5, 3.2))
    cam = bpy.context.active_object
    direction = sphere.location - cam.location
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    cam.data.lens = 40
    scene.camera = cam
    return scene


def configure(scene: bpy.types.Scene, args: argparse.Namespace, out: Path) -> None:
    r = scene.render
    r.engine = ENGINES[args.engine]
    r.resolution_x, r.resolution_y, r.resolution_percentage = args.width, args.height, 100
    r.image_settings.file_format = "PNG"
    r.filepath = str(out)
    if args.threads:
        r.threads_mode, r.threads = "FIXED", args.threads

    if args.engine == "cycles":
        c = scene.cycles
        c.device = "CPU"
        c.samples = args.samples
        c.use_adaptive_sampling = True
        c.use_denoising = not args.no_denoise
        if c.use_denoising:
            c.denoiser = "OPENIMAGEDENOISE"
    elif args.engine == "eevee":
        scene.eevee.taa_render_samples = args.samples


def main() -> int:
    args = parse_args()
    out = Path(args.out).resolve()
    out.parent.mkdir(parents=True, exist_ok=True)

    scene = build_scene()
    configure(scene, args, out)

    t0 = time.perf_counter()
    bpy.ops.render.render(write_still=True)
    dt = time.perf_counter() - t0

    if args.engine in ("eevee", "workbench"):
        # EEVEE/Workbench need an OpenGL context; headless this is EGL + Mesa (llvmpipe).
        try:
            import gpu

            print(f"GPU backend={gpu.platform.backend_type_get()} renderer={gpu.platform.renderer_get()}")
        except Exception as e:  # informational only
            print(f"GPU info unavailable: {e}")

    print(
        f"RESULT engine={scene.render.engine} samples={args.samples} "
        f"denoise={getattr(scene.cycles, 'use_denoising', None) if args.engine == 'cycles' else '-'} "
        f"size={args.width}x{args.height} time={dt:.2f}s out={out} exists={out.exists()}"
    )
    return 0 if out.exists() else 1


if __name__ == "__main__":
    sys.exit(main())
