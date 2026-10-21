"""ウラトリの3Dカットを bpy（Blender 5.2）で作って連番 PNG に書き出す。

  shot_a_papers    : 机の上に「お知らせ」の紙が次々に置かれていく（公表が相次ぐ）
  shot_b_magnifier : 虫めがねが紙面の上を動き、黄色のマーカーの1行で止まる（一次情報を読む）

紙の画像は Remotion の Still（video/src/uratori/Textures.tsx）で作り、textures/ に置く。

  .venv/bin/python shots.py --shot a                # 本番（全フレーム）
  .venv/bin/python shots.py --shot b --frames 1 1   # 1コマだけ試す
  ffmpeg で video/public/blender/<shot>.mp4 にまとめるのは render_shots.sh
"""
from __future__ import annotations

import argparse
import math
import random
import sys
import time
from pathlib import Path

import bpy  # bpy を先に読み込む（bmesh は bpy の中から提供される）
import bmesh
from mathutils import Vector

HERE = Path(__file__).resolve().parent
TEX = HERE / "textures"
FPS = 24
SHOTS = {"a": ("shot_a_papers", 6.5), "b": ("shot_b_magnifier", 5.5)}
A4 = (0.210, 0.297)


# ---------- 部品 ----------

def reset() -> bpy.types.Scene:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.fps = FPS
    return sc


def world(sc: bpy.types.Scene, color=(0.012, 0.014, 0.02), strength=1.0) -> None:
    w = bpy.data.worlds.new("World")
    bg = w.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (*color, 1.0)
    bg.inputs["Strength"].default_value = strength
    sc.world = w


def desk_material() -> bpy.types.Material:
    """暗い木の机（ノイズで木目っぽいむらを付ける）。"""
    m = bpy.data.materials.new("Desk")
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mapping = nt.nodes.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (1.0, 14.0, 1.0)  # 片方向に伸ばして木目に
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 3.0
    noise.inputs["Detail"].default_value = 8.0
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (0.035, 0.026, 0.020, 1)
    ramp.color_ramp.elements[1].color = (0.085, 0.062, 0.045, 1)
    nt.links.new(tc.outputs["Object"], mapping.inputs["Vector"])
    nt.links.new(mapping.outputs["Vector"], noise.inputs["Vector"])
    nt.links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.42
    return m


def image_material(name: str, path: Path, roughness=0.78) -> bpy.types.Material:
    m = bpy.data.materials.new(name)
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    img = nt.nodes.new("ShaderNodeTexImage")
    img.image = bpy.data.images.load(str(path))
    img.interpolation = "Cubic"
    nt.links.new(img.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = roughness
    return m


def add_plane(name: str, size: tuple[float, float], cuts: int = 0) -> bpy.types.Object:
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bm.loops.layers.uv.new("UVMap")  # これが無いと calc_uvs が効かず、画像が貼られない
    bmesh.ops.create_grid(bm, x_segments=max(1, cuts), y_segments=max(1, cuts), size=0.5, calc_uvs=True)
    for v in bm.verts:
        v.co.x *= size[0]
        v.co.y *= size[1]
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    return ob


def paper(name: str, tex: Path, loc, rot_z: float, bend: float = 0.0) -> bpy.types.Object:
    ob = add_plane(name, A4, cuts=24)
    ob.location = loc
    ob.rotation_euler = (0, 0, rot_z)
    ob.data.materials.append(image_material(f"M_{name}", tex))
    if bend:
        mod = ob.modifiers.new("bend", "SIMPLE_DEFORM")
        mod.deform_method = "BEND"
        mod.deform_axis = "Y"
        mod.angle = bend
    return ob


def area_light(name, loc, target, energy, size, color=(1, 1, 1)) -> bpy.types.Object:
    data = bpy.data.lights.new(name, "AREA")
    data.energy = energy
    data.size = size
    data.color = color
    ob = bpy.data.objects.new(name, data)
    bpy.context.scene.collection.objects.link(ob)
    ob.location = loc
    ob.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    return ob


def camera(sc, lens=50.0, fstop=2.8) -> tuple[bpy.types.Object, bpy.types.Object]:
    cd = bpy.data.cameras.new("Cam")
    cd.lens = lens
    cam = bpy.data.objects.new("Cam", cd)
    sc.collection.objects.link(cam)
    target = bpy.data.objects.new("Target", None)
    sc.collection.objects.link(target)
    tr = cam.constraints.new("TRACK_TO")
    tr.target = target
    tr.track_axis = "TRACK_NEGATIVE_Z"
    tr.up_axis = "UP_Y"
    cd.dof.use_dof = True
    cd.dof.focus_object = target
    cd.dof.aperture_fstop = fstop
    sc.camera = cam
    return cam, target


def key(ob, attr: str, frame: int, value, interp="BEZIER") -> None:
    setattr(ob, attr, value)
    ob.keyframe_insert(attr, frame=frame)
    if ob.animation_data and ob.animation_data.action:
        for fc in getattr(ob.animation_data.action, "fcurves", []):
            for kp in fc.keyframe_points:
                kp.interpolation = interp


# ---------- ショット ----------

def shot_a(sc: bpy.types.Scene, frames: int) -> None:
    """紙が1枚ずつ机に置かれる。最後の1枚（主役）にピントが合っていく。"""
    world(sc)
    desk = add_plane("Desk", (4, 4))
    desk.data.materials.append(desk_material())

    rnd = random.Random(7)
    # (x, y, 回転) 主役は最後に置かれる中央の1枚
    spots = [(-0.20, 0.10, 0.35), (0.22, 0.12, -0.28), (-0.12, -0.14, -0.12),
             (0.24, -0.12, 0.22), (0.02, 0.20, 0.08), (0.00, -0.01, -0.05)]
    variants = [3, 4, 2, 5, 1, 0]
    arrive = [int(frames * f) for f in (0.02, 0.12, 0.22, 0.32, 0.42, 0.52)]
    land = 16  # 置かれるまでのフレーム数
    for i, ((x, y, r), v, a) in enumerate(zip(spots, variants, arrive)):
        z = 0.0006 * (i + 1)
        ob = paper(f"Paper{i}", TEX / f"notice_{v}.png", (x, y, z), r, bend=rnd.uniform(-0.08, 0.08))
        # 上から少しずれた位置・角度で入ってきて、ふわっと着地する
        start = Vector((x + rnd.uniform(-0.25, 0.25), y + rnd.uniform(0.25, 0.4), z + 0.22))
        key(ob, "location", 0, start)
        key(ob, "location", max(0, a - 1), start)
        key(ob, "location", a + land, Vector((x, y, z)))
        key(ob, "rotation_euler", max(0, a - 1), (rnd.uniform(-0.3, 0.3), rnd.uniform(-0.3, 0.3), r + rnd.uniform(-0.6, 0.6)))
        key(ob, "rotation_euler", a + land, (0, 0, r))
        # 着地前は見えないように（画面の外から入るので、最初のコマで宙に浮いて見えないよう縮めておく）
        key(ob, "scale", max(0, a - 1), (0.001, 0.001, 0.001), "CONSTANT")
        key(ob, "scale", a, (1, 1, 1), "CONSTANT")

    area_light("Key", (-0.9, -0.5, 1.2), (0, 0, 0), 16, 0.6, (1.0, 0.86, 0.68))
    area_light("Fill", (1.2, -1.0, 0.8), (0, 0, 0), 3, 1.5, (0.75, 0.82, 1.0))
    area_light("Rim", (0.2, 1.4, 0.6), (0, 0, 0), 4, 1.0, (1.0, 0.95, 0.9))

    cam, target = camera(sc, lens=45, fstop=2.2)
    key(cam, "location", 0, Vector((-0.30, -0.95, 0.80)))
    key(cam, "location", frames, Vector((-0.05, -0.50, 0.42)))
    key(target, "location", 0, Vector((0.0, 0.02, 0.0)))
    key(target, "location", frames, Vector((0.0, 0.05, 0.0)))  # 主役の紙の見出しあたり


def lens_material(report: bpy.types.Object, root: bpy.types.Object, tex: Path, mag: float) -> bpy.types.Material:
    """下の紙面を mag 倍に拡大して映すレンズ（屈折の計算はせず、紙の UV をずらして描く）。

    レンズ面の点を紙の座標で見た p_paper と、虫めがねの中心から見た p_lens から
    uv = p_paper - p_lens * (1 - 1/mag) とすると、中心のまわりが mag 倍に見える。
    """
    m = bpy.data.materials.new("Lens")
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    tc_paper = nt.nodes.new("ShaderNodeTexCoord")
    tc_paper.object = report
    tc_lens = nt.nodes.new("ShaderNodeTexCoord")
    tc_lens.object = root
    shrink = nt.nodes.new("ShaderNodeVectorMath")
    shrink.operation = "SCALE"
    shrink.inputs["Scale"].default_value = 1 - 1 / mag
    sub = nt.nodes.new("ShaderNodeVectorMath")
    sub.operation = "SUBTRACT"
    to_uv = nt.nodes.new("ShaderNodeVectorMath")
    to_uv.operation = "MULTIPLY_ADD"
    to_uv.inputs[1].default_value = (1 / A4[0], 1 / A4[1], 0)
    to_uv.inputs[2].default_value = (0.5, 0.5, 0)
    img = nt.nodes.new("ShaderNodeTexImage")
    img.image = bpy.data.images.load(str(tex))
    img.interpolation = "Cubic"
    img.extension = "EXTEND"
    # 縁に向かって少し暗く（レンズの縁の感じ）
    dist = nt.nodes.new("ShaderNodeVectorMath")
    dist.operation = "LENGTH"
    ramp = nt.nodes.new("ShaderNodeMapRange")
    ramp.inputs["From Min"].default_value = 0.045
    ramp.inputs["From Max"].default_value = 0.074
    ramp.inputs["To Min"].default_value = 1.0
    ramp.inputs["To Max"].default_value = 0.72
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.blend_type = "MULTIPLY"
    mix.inputs["Factor"].default_value = 1.0
    L = nt.links.new
    L(tc_lens.outputs["Object"], shrink.inputs[0])
    L(tc_paper.outputs["Object"], sub.inputs[0])
    L(shrink.outputs["Vector"], sub.inputs[1])
    L(sub.outputs["Vector"], to_uv.inputs[0])
    L(to_uv.outputs["Vector"], img.inputs["Vector"])
    L(tc_lens.outputs["Object"], dist.inputs[0])
    L(dist.outputs["Value"], ramp.inputs["Value"])
    L(img.outputs["Color"], mix.inputs["A"])
    L(ramp.outputs["Result"], mix.inputs["B"])
    L(mix.outputs["Result"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.8
    # ガラスの表面の映り込み
    bsdf.inputs["Coat Weight"].default_value = 1.0
    bsdf.inputs["Coat Roughness"].default_value = 0.03
    return m


def magnifier(sc: bpy.types.Scene, report: bpy.types.Object, tex: Path, mag: float = 1.8) -> bpy.types.Object:
    """縁は黒い金属、レンズは下の紙面を拡大して映す。親の Empty（回転・拡大なし）を動かす。"""
    root = bpy.data.objects.new("Magnifier", None)
    sc.collection.objects.link(root)

    metal = bpy.data.materials.new("Metal")
    b = metal.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (0.02, 0.02, 0.02, 1)
    b.inputs["Metallic"].default_value = 0.9
    b.inputs["Roughness"].default_value = 0.28

    bpy.ops.mesh.primitive_torus_add(major_radius=0.075, minor_radius=0.006, major_segments=96, minor_segments=24)
    rim = bpy.context.active_object
    rim.data.materials.append(metal)
    bpy.ops.object.shade_smooth()
    rim.parent = root

    bpy.ops.mesh.primitive_cylinder_add(radius=0.008, depth=0.15, vertices=32)
    handle = bpy.context.active_object
    handle.data.materials.append(metal)
    handle.rotation_euler = (0, math.radians(90), math.radians(-35))
    d = Vector((math.cos(math.radians(-35)), math.sin(math.radians(-35)), 0))
    handle.location = d * (0.075 + 0.075)
    bpy.ops.object.shade_smooth()
    handle.parent = root

    bpy.ops.mesh.primitive_circle_add(radius=0.0745, vertices=96, fill_type="NGON")
    lens = bpy.context.active_object
    lens.data.materials.append(lens_material(report, root, tex, mag))
    lens.visible_shadow = False  # ガラスなので影を落とさない
    lens.parent = root
    return root


def shot_b(sc: bpy.types.Scene, frames: int) -> None:
    """紙面の上を虫めがねが動き、マーカーの1行（VPN機器のあたり）で止まる。"""
    world(sc)
    desk = add_plane("Desk", (4, 4))
    desk.data.materials.append(desk_material())
    report = paper("Report", TEX / "report.png", (0, 0, 0.0008), 0.0, bend=0.0)
    paper("Under1", TEX / "notice_2.png", (-0.17, 0.05, 0.0004), 0.18, bend=0.05)
    paper("Under2", TEX / "notice_4.png", (0.19, -0.06, 0.0002), -0.22, bend=-0.04)

    # マーカーの1行は report.png の上から 640〜700px（1754px 中）。「VPN機器」は左から約 800px
    line_y = A4[1] * (0.5 - 0.382)
    vpn_x = A4[0] * (800 / 1240 - 0.5)
    m = magnifier(sc, report, TEX / "report.png")
    z = 0.05
    key(m, "location", 0, Vector((-0.045, line_y - 0.085, z)))  # 最初から紙面（report）の上に置く
    key(m, "location", int(frames * 0.6), Vector((vpn_x - 0.004, line_y - 0.002, z)))
    key(m, "location", frames, Vector((vpn_x, line_y, z)))

    area_light("Key", (-0.6, -0.4, 0.9), (0, 0, 0), 10, 0.5, (1.0, 0.88, 0.72))
    area_light("Fill", (0.8, -0.6, 0.7), (0, 0, 0), 2.5, 1.2, (0.78, 0.84, 1.0))

    cam, target = camera(sc, lens=50, fstop=5.6)
    key(cam, "location", 0, Vector((-0.04, line_y - 0.40, 0.52)))
    key(cam, "location", frames, Vector((0.0, line_y - 0.32, 0.42)))
    key(target, "location", 0, Vector((-0.04, line_y + 0.01, 0)))
    key(target, "location", frames, Vector((0.0, line_y + 0.01, 0)))


def configure(sc, args, out_dir: Path) -> None:
    r = sc.render
    r.engine = "BLENDER_EEVEE" if args.engine == "eevee" else "CYCLES"
    r.resolution_x, r.resolution_y = 1920, 1080
    r.resolution_percentage = args.res
    r.image_settings.file_format = "PNG"
    r.filepath = str(out_dir / "####")
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Medium High Contrast"
    if args.engine == "eevee":
        sc.eevee.taa_render_samples = args.samples
        if hasattr(sc.eevee, "use_raytracing"):
            sc.eevee.use_raytracing = False  # 屈折はシェーダーで作るので使わない（遅い）
        if hasattr(sc.eevee, "use_shadows"):
            sc.eevee.use_shadows = True
    else:
        c = sc.cycles
        c.device = "CPU"
        c.samples = args.samples
        c.use_denoising = True
        c.denoiser = "OPENIMAGEDENOISE"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--shot", choices=sorted(SHOTS), required=True)
    ap.add_argument("--engine", choices=["eevee", "cycles"], default="eevee")
    ap.add_argument("--samples", type=int, default=12)
    ap.add_argument("--res", type=int, default=100, help="解像度の％（試しは 50 など）")
    ap.add_argument("--frames", type=int, nargs=2, metavar=("START", "END"), help="書き出すフレーム（1始まり）")
    ap.add_argument("--save-blend", action="store_true")
    args = ap.parse_args()

    name, seconds = SHOTS[args.shot]
    frames = int(seconds * FPS)
    sc = reset()
    sc.frame_start, sc.frame_end = 1, frames
    (shot_a if args.shot == "a" else shot_b)(sc, frames)
    out_dir = HERE / "renders" / name
    out_dir.mkdir(parents=True, exist_ok=True)
    configure(sc, args, out_dir)
    if args.save_blend:
        bpy.ops.wm.save_as_mainfile(filepath=str(HERE / "renders" / f"{name}.blend"))

    start, end = args.frames or (1, frames)
    t0 = time.perf_counter()
    for f in range(start, end + 1):
        sc.frame_set(f)
        sc.render.filepath = str(out_dir / f"{f:04d}.png")
        bpy.ops.render.render(write_still=True)
        print(f"[{name}] frame {f}/{end}  {time.perf_counter() - t0:.1f}s", flush=True)
    print(f"done {name}: {end - start + 1} frames in {time.perf_counter() - t0:.1f}s")
    return 0


if __name__ == "__main__":
    sys.exit(main())
