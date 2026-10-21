"""「考える夜」PROLOGUE の場面を bpy（Blender 5.2）で描く。

静止画（Cycles）で描いて Remotion でゆっくり寄る場面と、影が伸びるアニメ（EEVEE）。
人物は顔を描かない影絵（シルエット）にしている。トンプソンは帽子・サングラス・
シガレットホルダーの輪郭だけで表す。

  .venv/bin/python kangaeru.py --scene louisville --preview      # 小さく速く試す
  .venv/bin/python kangaeru.py --scene louisville                # 本番の静止画
  .venv/bin/python kangaeru.py --scene shadow                    # アニメ（連番 PNG）
  シーン: louisville / derby / reporter / shadow / window / strings
"""
from __future__ import annotations

import argparse
import math
import random
import sys
import time
from pathlib import Path

import bpy  # bpy を先に読み込む（bmesh は bpy の中から提供される）
import bmesh  # noqa: F401
from mathutils import Euler, Matrix, Vector

HERE = Path(__file__).resolve().parent
OUT = HERE / "renders" / "kangaeru"
STILL_SIZE = (1920, 1080)
ANIM_SIZE = (1280, 720)
FPS = 24


# ---------------- 基本 ----------------

def reset() -> bpy.types.Scene:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.fps = FPS
    return sc


def link(ob: bpy.types.Object) -> bpy.types.Object:
    bpy.context.scene.collection.objects.link(ob)
    return ob


def mat(name: str, color=(0.5, 0.5, 0.5), rough=0.5, metal=0.0, emit=None, emit_strength=0.0,
        transmission=0.0, ior=1.45, alpha=1.0) -> bpy.types.Material:
    m = bpy.data.materials.new(name)
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    b.inputs["Transmission Weight"].default_value = transmission
    b.inputs["IOR"].default_value = ior
    b.inputs["Alpha"].default_value = alpha
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1)
        b.inputs["Emission Strength"].default_value = emit_strength
    return m


def emission(name: str, color, strength) -> bpy.types.Material:
    m = bpy.data.materials.new(name)
    nt = m.node_tree
    nt.nodes.remove(nt.nodes["Principled BSDF"])
    e = nt.nodes.new("ShaderNodeEmission")
    e.inputs["Color"].default_value = (*color, 1)
    e.inputs["Strength"].default_value = strength
    nt.links.new(e.outputs["Emission"], nt.nodes["Material Output"].inputs["Surface"])
    return m


def prim(kind: str, name: str, mat_: bpy.types.Material | None = None, smooth=True, **kw) -> bpy.types.Object:
    getattr(bpy.ops.mesh, f"primitive_{kind}_add")(**kw)
    ob = bpy.context.active_object
    ob.name = name
    if mat_:
        ob.data.materials.append(mat_)
    if smooth and kind in ("uv_sphere", "cylinder", "cone", "torus"):
        bpy.ops.object.shade_smooth()
    return ob


def look_at(ob: bpy.types.Object, target) -> None:
    ob.rotation_euler = (Vector(target) - ob.location).to_track_quat("-Z", "Y").to_euler()


def camera(loc, target, lens=50.0, fstop=None, focus=None) -> bpy.types.Object:
    cd = bpy.data.cameras.new("Cam")
    cd.lens = lens
    cd.sensor_width = 36
    cam = link(bpy.data.objects.new("Cam", cd))
    cam.location = loc
    look_at(cam, target)
    if fstop:
        cd.dof.use_dof = True
        cd.dof.aperture_fstop = fstop
        cd.dof.focus_distance = focus if focus else (Vector(target) - Vector(loc)).length
    bpy.context.scene.camera = cam
    return cam


def light(kind: str, loc, energy, color=(1, 1, 1), size=0.1, target=None, spot=None) -> bpy.types.Object:
    d = bpy.data.lights.new(f"L_{kind}", kind)
    d.energy = energy
    d.color = color
    if kind in ("POINT", "SPOT"):
        d.shadow_soft_size = size
    if kind == "AREA":
        d.size = size
    if kind == "SUN":
        d.angle = size
    if kind == "SPOT" and spot:
        d.spot_size = math.radians(spot)
        d.spot_blend = 0.35
    ob = link(bpy.data.objects.new(f"L_{kind}", d))
    ob.location = loc
    if target is not None:
        look_at(ob, target)
    return ob


def world_color(color, strength=1.0) -> bpy.types.World:
    w = bpy.data.worlds.new("World")
    bg = w.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (*color, 1)
    bg.inputs["Strength"].default_value = strength
    bpy.context.scene.world = w
    return w


def world_sunset(sun_dir, strength=1.0) -> bpy.types.World:
    """夕焼けの空: 高さで色を変えるグラデーション＋太陽のまわりの光。"""
    w = bpy.data.worlds.new("World")
    nt = w.node_tree
    bg = nt.nodes["Background"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    norm = nt.nodes.new("ShaderNodeVectorMath")
    norm.operation = "NORMALIZE"
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    cr = ramp.color_ramp
    cr.elements[0].position = 0.5
    cr.elements[0].color = (0.9, 0.42, 0.16, 1)    # 地平線
    cr.elements[1].position = 1.0
    cr.elements[1].color = (0.03, 0.04, 0.09, 1)   # 天頂
    for pos, col in ((0.47, (0.08, 0.05, 0.04, 1)), (0.53, (0.95, 0.55, 0.25, 1)), (0.6, (0.55, 0.3, 0.3, 1)),
                     (0.72, (0.16, 0.12, 0.2, 1))):
        e = cr.elements.new(pos)
        e.color = col
    to01 = nt.nodes.new("ShaderNodeMapRange")  # z(-1..1) → 0..1
    to01.inputs["From Min"].default_value = -1
    to01.inputs["From Max"].default_value = 1
    dot = nt.nodes.new("ShaderNodeVectorMath")
    dot.operation = "DOT_PRODUCT"
    dot.inputs[1].default_value = Vector(sun_dir).normalized()
    core = nt.nodes.new("ShaderNodeMapRange")
    core.inputs["From Min"].default_value = 0.9993
    core.inputs["From Max"].default_value = 0.9997
    core.inputs["To Max"].default_value = 60.0
    halo = nt.nodes.new("ShaderNodeMath")
    halo.operation = "POWER"
    halo.inputs[1].default_value = 90.0
    halo_s = nt.nodes.new("ShaderNodeMath")
    halo_s.operation = "MULTIPLY"
    halo_s.inputs[1].default_value = 3.0
    clampd = nt.nodes.new("ShaderNodeClamp")
    add = nt.nodes.new("ShaderNodeMath")
    add.operation = "ADD"
    sun_col = nt.nodes.new("ShaderNodeMix")
    sun_col.data_type = "RGBA"
    sun_col.blend_type = "ADD"
    sun_col.inputs["B"].default_value = (1.0, 0.62, 0.3, 1)
    L = nt.links.new
    L(tc.outputs["Generated"], norm.inputs[0])
    L(norm.outputs["Vector"], sep.inputs["Vector"])
    L(sep.outputs["Z"], to01.inputs["Value"])
    L(to01.outputs["Result"], ramp.inputs["Fac"])
    L(norm.outputs["Vector"], dot.inputs[0])
    L(dot.outputs["Value"], core.inputs["Value"])
    L(dot.outputs["Value"], clampd.inputs["Value"])
    L(clampd.outputs["Result"], halo.inputs[0])
    L(halo.outputs["Value"], halo_s.inputs[0])
    L(core.outputs["Result"], add.inputs[0])
    L(halo_s.outputs["Value"], add.inputs[1])
    L(add.outputs["Value"], sun_col.inputs["Factor"])
    L(ramp.outputs["Color"], sun_col.inputs["A"])
    L(sun_col.outputs["Result"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = strength
    bpy.context.scene.world = w
    return w


def haze_box(center, size, density, color=(1, 0.9, 0.8), anisotropy=0.5) -> bpy.types.Object:
    """限られた範囲だけの霧（屋外で空まで霧で埋まらないように）。"""
    ob = prim("cube", "Haze", None, size=1, location=center)
    ob.scale = size
    m = bpy.data.materials.new("haze")
    nt = m.node_tree
    nt.nodes.remove(nt.nodes["Principled BSDF"])
    v = nt.nodes.new("ShaderNodeVolumePrincipled")
    v.inputs["Density"].default_value = density
    v.inputs["Color"].default_value = (*color, 1)
    v.inputs["Anisotropy"].default_value = anisotropy
    nt.links.new(v.outputs["Volume"], nt.nodes["Material Output"].inputs["Volume"])
    ob.data.materials.append(m)
    return ob


def world_haze(w: bpy.types.World, density: float, color=(1, 1, 1), anisotropy=0.4) -> None:
    """世界全体にうすい霧（光の筋が見えるように）。"""
    nt = w.node_tree
    v = nt.nodes.new("ShaderNodeVolumePrincipled")
    v.inputs["Density"].default_value = density
    v.inputs["Color"].default_value = (*color, 1)
    v.inputs["Anisotropy"].default_value = anisotropy
    nt.links.new(v.outputs["Volume"], nt.nodes["World Output"].inputs["Volume"])


def noise_bump(m: bpy.types.Material, scale=40.0, strength=0.2) -> None:
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    n = nt.nodes.new("ShaderNodeTexNoise")
    n.inputs["Scale"].default_value = scale
    n.inputs["Detail"].default_value = 10
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = strength
    nt.links.new(n.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])


def noise_color(m: bpy.types.Material, c1, c2, scale=3.0, stretch=(1, 1, 1)) -> None:
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = stretch
    n = nt.nodes.new("ShaderNodeTexNoise")
    n.inputs["Scale"].default_value = scale
    n.inputs["Detail"].default_value = 8
    r = nt.nodes.new("ShaderNodeValToRGB")
    r.color_ramp.elements[0].color = (*c1, 1)
    r.color_ramp.elements[1].color = (*c2, 1)
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    nt.links.new(mp.outputs["Vector"], n.inputs["Vector"])
    nt.links.new(n.outputs["Fac"], r.inputs["Fac"])
    nt.links.new(r.outputs["Color"], b.inputs["Base Color"])


def join(objs: list[bpy.types.Object], name: str) -> bpy.types.Object:
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    ob = bpy.context.active_object
    ob.name = name
    return ob


# ---------------- 人物（影絵） ----------------

def person(name: str, cloth: bpy.types.Material, hat=False, glasses=False, holder=False,
           arms="down", loc=(0, 0, 0), rot_z=0.0, ember: bpy.types.Material | None = None) -> bpy.types.Object:
    """+X を向いて立つ男の影絵。顔は描かず、輪郭（帽子・サングラス・ホルダー）だけ。"""
    parts = []
    # 頭・首・あご・鼻（横顔の輪郭を作る）
    parts.append(prim("uv_sphere", "head", cloth, radius=0.1, location=(0, 0, 1.66), segments=48, ring_count=24))
    parts[-1].scale = (1.0, 0.86, 1.12)
    parts.append(prim("uv_sphere", "jaw", cloth, radius=0.07, location=(0.035, 0, 1.585), segments=32, ring_count=16))
    parts[-1].scale = (1.0, 0.95, 0.9)
    parts.append(prim("cone", "nose", cloth, radius1=0.022, radius2=0.0, depth=0.05, vertices=16,
                      location=(0.105, 0, 1.655), rotation=(0, math.radians(100), 0)))
    parts.append(prim("cylinder", "neck", cloth, radius=0.055, depth=0.12, location=(0.0, 0, 1.51), vertices=24))
    # 胴は楕円体を重ねて丸く（肩幅は Y、厚みは X）
    for nm, sc_, z in (("chest", (0.13, 0.235, 0.12), 1.39), ("torso", (0.13, 0.205, 0.3), 1.17),
                       ("hips", (0.125, 0.18, 0.14), 0.9)):
        parts.append(prim("uv_sphere", nm, cloth, radius=1.0, location=(0, 0, z), segments=32, ring_count=16))
        parts[-1].scale = sc_
    for side in (-1, 1):
        parts.append(prim("uv_sphere", f"shoulder{side}", cloth, radius=0.075, location=(0, side * 0.2, 1.38), segments=24, ring_count=12))
        if arms == "down":
            parts.append(prim("cylinder", f"arm{side}", cloth, radius=0.05, depth=0.62, vertices=20,
                              location=(0.01, side * 0.235, 1.1), rotation=(side * math.radians(4), 0, 0)))
        elif arms == "raised":  # 糸で少し持ち上げられた腕
            parts.append(prim("cylinder", f"arm{side}", cloth, radius=0.05, depth=0.62, vertices=20,
                              location=(0.02, side * 0.33, 1.16), rotation=(side * -math.radians(-28), 0, 0)))
        elif arms == "pockets":
            parts.append(prim("cylinder", f"arm{side}", cloth, radius=0.05, depth=0.55, vertices=20,
                              location=(0.02, side * 0.235, 1.14), rotation=(side * math.radians(6), math.radians(-12), 0)))
        parts.append(prim("cylinder", f"leg{side}", cloth, radius=0.07, depth=0.86, vertices=20,
                          location=(0, side * 0.1, 0.43)))
        parts.append(prim("cube", f"shoe{side}", cloth, size=1, location=(0.05, side * 0.1, 0.03)))
        parts[-1].scale = (0.27, 0.1, 0.07)
    if hat:  # バケットハット: 低い山＋垂れたつば
        parts.append(prim("cylinder", "crown", cloth, radius=0.105, depth=0.085, vertices=48, location=(0, 0, 1.79)))
        parts.append(prim("cone", "brim", cloth, radius1=0.175, radius2=0.11, depth=0.045, vertices=48,
                          location=(0, 0, 1.735)))
    if glasses:  # 大きめのティアドロップのサングラス（横から見ると板）
        parts.append(prim("cube", "lens", cloth, size=1, location=(0.098, 0, 1.675)))
        parts[-1].scale = (0.012, 0.19, 0.055)
        parts.append(prim("cube", "temple", cloth, size=1, location=(0.03, 0, 1.69)))
        parts[-1].scale = (0.14, 0.2, 0.008)
    if holder:  # 口元から斜め上に伸びるシガレットホルダー
        ang = math.radians(28)
        L = 0.2
        cx, cz = 0.11 + math.cos(ang) * L / 2, 1.585 + math.sin(ang) * L / 2
        parts.append(prim("cylinder", "holder", cloth, radius=0.0045, depth=L, vertices=12,
                          location=(cx, 0, cz), rotation=(0, math.radians(90) - ang, 0)))
    body = join(parts, name)
    # join すると原点が頭（最初の部品）に移るので、形はそのままで原点を足もと（0,0,0）に戻す
    body.data.transform(Matrix.Translation(body.location))
    body.location = (0, 0, 0)
    for p in body.data.polygons:
        p.use_smooth = True
    body.location = loc
    body.rotation_euler = (0, 0, rot_z)
    if holder and ember:
        ang = math.radians(28)
        tip = Vector((0.11 + math.cos(ang) * 0.2, 0, 1.585 + math.sin(ang) * 0.2))
        e = prim("uv_sphere", "ember", ember, radius=0.0075, location=tip, segments=16, ring_count=8)
        e.parent = body
    return body


def smoke(origin, height=0.6, density=6.0, name="Smoke") -> bpy.types.Object:
    """たばこの煙: 細い箱の中に、ノイズでまだらにした薄い霧。"""
    ob = prim("cube", name, None, size=1, location=(origin[0], origin[1], origin[2] + height / 2))
    ob.scale = (0.14, 0.14, height)
    m = bpy.data.materials.new(name)
    nt = m.node_tree
    nt.nodes.remove(nt.nodes["Principled BSDF"])
    tc = nt.nodes.new("ShaderNodeTexCoord")
    n = nt.nodes.new("ShaderNodeTexNoise")
    n.inputs["Scale"].default_value = 2.2
    n.inputs["Detail"].default_value = 6
    n.inputs["Distortion"].default_value = 1.2
    grad = nt.nodes.new("ShaderNodeTexGradient")
    grad.gradient_type = "SPHERICAL"
    mul = nt.nodes.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    ramp = nt.nodes.new("ShaderNodeMapRange")
    ramp.inputs["From Min"].default_value = 0.45
    ramp.inputs["From Max"].default_value = 0.8
    dens = nt.nodes.new("ShaderNodeMath")
    dens.operation = "MULTIPLY"
    dens.inputs[1].default_value = density
    vol = nt.nodes.new("ShaderNodeVolumePrincipled")
    vol.inputs["Color"].default_value = (0.8, 0.8, 0.85, 1)
    L = nt.links.new
    L(tc.outputs["Object"], n.inputs["Vector"])
    L(tc.outputs["Object"], grad.inputs["Vector"])
    L(n.outputs["Fac"], ramp.inputs["Value"])
    L(ramp.outputs["Result"], mul.inputs[0])
    L(grad.outputs["Fac"], mul.inputs[1])
    L(mul.outputs["Value"], dens.inputs[0])
    L(dens.outputs["Value"], vol.inputs["Density"])
    L(vol.outputs["Volume"], nt.nodes["Material Output"].inputs["Volume"])
    ob.data.materials.append(m)
    return ob


def crowd(n: int, area, seed=3, hats=True, cloth=None, z=0.0) -> list[bpy.types.Object]:
    """遠くの観客（帽子の色はさまざま）。ぼかして色の点として見せる。"""
    rnd = random.Random(seed)
    cols = [(0.9, 0.25, 0.45), (0.95, 0.8, 0.25), (0.2, 0.7, 0.75), (0.95, 0.95, 0.9), (0.85, 0.45, 0.2),
            (0.55, 0.3, 0.75), (0.9, 0.6, 0.7)]
    hat_mats = [mat(f"hat{i}", c, 0.6) for i, c in enumerate(cols)]
    body_m = cloth or mat("crowdcloth", (0.06, 0.05, 0.05), 0.8)
    objs = []
    (x0, x1), (y0, y1) = area
    for i in range(n):
        x, y = rnd.uniform(x0, x1), rnd.uniform(y0, y1)
        h = rnd.uniform(1.55, 1.85)
        b = prim("cylinder", f"c{i}", body_m, radius=0.2, depth=h - 0.25, vertices=10, location=(x, y, z + (h - 0.25) / 2))
        hd = prim("uv_sphere", f"ch{i}", body_m, radius=0.11, location=(x, y, z + h - 0.12), segments=12, ring_count=6)
        objs += [b, hd]
        if hats and rnd.random() < 0.75:
            r = rnd.uniform(0.18, 0.32)
            hat = prim("cylinder", f"hat{i}", rnd.choice(hat_mats), radius=r, depth=0.02, vertices=24,
                       location=(x, y, z + h - 0.02), rotation=(rnd.uniform(-0.2, 0.2), rnd.uniform(-0.2, 0.2), 0))
            objs.append(hat)
    return objs


# ---------------- 場面 ----------------

def scene_louisville(sc) -> None:
    """1970年、ルイビル。夕方の競馬場、逆光の観客席と2本の尖塔。"""
    sun_dir = Vector((0.42, 1.0, 0.075)).normalized()  # 観客席の右奥、地平線すれすれ
    world_sunset(sun_dir, 1.0)
    haze_box((0, 35, 12), (160, 80, 24), 0.006, (1.0, 0.8, 0.6), 0.65)
    sun = light("SUN", (0, 0, 10), 3.0, (1.0, 0.6, 0.32), size=math.radians(1.0))
    look_at(sun, sun.location - sun_dir)  # 光は太陽の方向からカメラの方へ

    dirt = mat("dirt", (0.25, 0.17, 0.11), 0.95)
    noise_color(dirt, (0.16, 0.1, 0.06), (0.33, 0.23, 0.15), 6, (1, 4, 1))
    noise_bump(dirt, 25, 0.35)
    prim("plane", "track", dirt, size=400, location=(0, 0, 0))

    dark = mat("stand", (0.05, 0.045, 0.045), 0.7)
    # 観客席（屋根つき）
    stand = prim("cube", "stand", dark, size=1, location=(0, 70, 7))
    stand.scale = (110, 14, 14)
    roof = prim("cube", "roof", dark, size=1, location=(0, 66, 14.5))
    roof.scale = (112, 20, 0.6)
    roof.rotation_euler = (math.radians(-7), 0, 0)
    # 2本の尖塔
    for sx in (-6.0, 6.0):
        prim("cylinder", "spirebase", dark, smooth=False, radius=2.0, depth=7, vertices=6, location=(sx + 8, 64, 18.5))
        prim("cylinder", "spirering", dark, smooth=False, radius=2.3, depth=0.6, vertices=6, location=(sx + 8, 64, 22.2))
        prim("cone", "spire", dark, smooth=False, radius1=2.3, radius2=0.05, depth=11, vertices=6, location=(sx + 8, 64, 28))
        prim("cylinder", "finial", dark, radius=0.08, depth=2.5, vertices=8, location=(sx + 8, 64, 34.5))
        # 尖塔の窓の明かり
        win = emission("winlight", (1.0, 0.75, 0.45), 6.0)
        prim("cube", "win", win, size=1, location=(sx + 8, 62.1, 19.5)).scale = (0.6, 0.05, 1.4)
    # 旗
    flagm = mat("flag", (0.5, 0.08, 0.08), 0.8)
    for i, x in enumerate(range(-40, 45, 16)):
        prim("cylinder", f"pole{i}", dark, radius=0.07, depth=6, vertices=8, location=(x, 63, 17.5))
        f = prim("plane", f"flag{i}", flagm, size=1, location=(x + 0.9, 63, 19.8))
        f.scale = (1.8, 1.0, 1)
        f.rotation_euler = (math.radians(90), 0, math.radians(8))
    # 観客席の照明
    bulb = emission("bulb", (1.0, 0.8, 0.55), 30.0)
    rnd = random.Random(5)
    for i in range(70):
        prim("uv_sphere", f"b{i}", bulb, radius=0.12, segments=8, ring_count=4,
             location=(rnd.uniform(-50, 50), 62.9, rnd.choice([4.0, 8.5, 12.5])))
    # 手前の白い柵（内ラチ）
    rail = mat("rail", (0.85, 0.83, 0.78), 0.4)
    for i in range(-30, 31):
        prim("cylinder", f"post{i}", rail, radius=0.05, depth=1.1, vertices=10, location=(i * 2.2, 9, 0.55))
    prim("cylinder", "railbar", rail, radius=0.07, depth=140, vertices=16, location=(0, 9, 1.12),
         rotation=(0, math.radians(90), 0))
    # 遠くの観客（柵の向こう）
    crowd(260, ((-45, 45), (52, 60)), seed=8)
    camera((-12, -6, 1.5), (4, 60, 13), lens=35)


def scene_derby(sc) -> None:
    """競馬場の手すりに置かれたバーボンのグラス。背景は派手な帽子の観客（ぼけ）。"""
    world_sunset(Vector((0.3, 1.0, 0.06)), 1.2)
    wood = mat("wood", (0.25, 0.14, 0.07), 0.45)
    noise_color(wood, (0.16, 0.08, 0.035), (0.36, 0.2, 0.1), 2.5, (1, 30, 1))
    rail = prim("cube", "rail", wood, size=1, location=(0, 0, 1.0))
    rail.scale = (3.0, 0.16, 0.07)
    # グラス（厚みのある円柱）
    glass = mat("glass", (1, 1, 1), 0.02, transmission=1.0, ior=1.5)
    g = prim("cylinder", "glass", glass, radius=0.042, depth=0.095, vertices=96, location=(0.0, 0.0, 1.035 + 0.0475))
    sol = g.modifiers.new("solid", "SOLIDIFY")
    sol.thickness = 0.003
    sol.offset = -1
    g.modifiers.new("sub", "SUBSURF").levels = 1
    bpy.context.view_layer.objects.active = g
    # 上の面を消して口を開ける
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="DESELECT")
    bpy.ops.object.mode_set(mode="OBJECT")
    for p in g.data.polygons:
        p.select = p.normal.z > 0.9 and p.center.z > 0
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.delete(type="FACE")
    bpy.ops.object.mode_set(mode="OBJECT")
    # 中身（琥珀色）
    liquor = bpy.data.materials.new("liquor")
    nt = liquor.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Transmission Weight"].default_value = 1.0
    b.inputs["Roughness"].default_value = 0.0
    b.inputs["IOR"].default_value = 1.36
    b.inputs["Base Color"].default_value = (1.0, 0.65, 0.3, 1)
    absb = nt.nodes.new("ShaderNodeVolumeAbsorption")
    absb.inputs["Color"].default_value = (0.95, 0.45, 0.12, 1)
    absb.inputs["Density"].default_value = 35
    nt.links.new(absb.outputs["Volume"], nt.nodes["Material Output"].inputs["Volume"])
    prim("cylinder", "liquor", liquor, radius=0.0385, depth=0.045, vertices=96, location=(0, 0, 1.035 + 0.006 + 0.0225))
    ice = mat("ice", (1, 1, 1), 0.08, transmission=1.0, ior=1.31)
    for i, (x, y, z, r) in enumerate([(-0.012, 0.008, 1.075, 0.3), (0.014, -0.006, 1.082, -0.5)]):
        c = prim("cube", f"ice{i}", ice, size=0.03, location=(x, y, z), rotation=(r, r * 0.7, r * 1.3))
        bv = c.modifiers.new("bevel", "BEVEL")
        bv.width = 0.004
        bv.segments = 4
    # 背景の観客（派手な帽子）
    crowd(220, ((-16, 10), (4, 24)), seed=4)
    stand_floor = mat("standfloor", (0.18, 0.15, 0.12), 0.9)
    prim("plane", "floor", stand_floor, size=200, location=(0, 0, 0))
    bulbs = emission("bulbs", (1.0, 0.78, 0.5), 25)
    rnd = random.Random(2)
    for i in range(50):
        prim("uv_sphere", f"bk{i}", bulbs, radius=0.06, segments=8, ring_count=4,
             location=(rnd.uniform(-12, 12), rnd.uniform(12, 30), rnd.uniform(2.5, 6.0)))
    # 逆光の夕日（グラスを光らせる）
    light("AREA", (0.6, 6, 2.0), 900, (1.0, 0.7, 0.42), size=3, target=(0, 0, 1.06))
    light("AREA", (-1.2, -1.5, 1.6), 25, (0.85, 0.9, 1.0), size=1.5, target=(0, 0, 1.06))
    # 観客は手前（カメラ側）からの夕日で照らし、帽子の色を見せる
    light("SUN", (0, 0, 10), 4.0, (1.0, 0.75, 0.5), size=math.radians(2)).rotation_euler = (math.radians(70), 0, math.radians(20))
    camera((-0.30, -0.50, 1.13), (-0.08, 0.0, 1.08), lens=70, fstop=2.4)


def curve_tube(name: str, pts, radius: float, m: bpy.types.Material, cyclic=False) -> bpy.types.Object:
    """点列を細い管にする（眼鏡の金属フレームなど）。"""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = 4
    sp = cu.splines.new("POLY")
    sp.points.add(len(pts) - 1)
    for p, c in zip(sp.points, pts):
        p.co = (*c, 1)
    sp.use_cyclic_u = cyclic
    ob = link(bpy.data.objects.new(name, cu))
    ob.data.materials.append(m)
    return ob


def aviators(loc, rot, metal: bpy.types.Material, lens_m: bpy.types.Material) -> None:
    """ティアドロップ型のサングラス（レンズ・金属の縁・ブリッジ・つる）。"""
    root = link(bpy.data.objects.new("Aviators", None))
    def outline(sign):
        pts = []
        for i in range(48):
            a = 2 * math.pi * i / 48
            x, y = math.cos(a) * 0.027, math.sin(a) * 0.022
            if y < 0:  # 下側を外へ垂らす（ティアドロップ）
                y *= 1.25
                x += sign * 0.006 * (-y / 0.0275)
            pts.append((sign * 0.034 + x, 0.0, y))
        return pts
    for sign in (-1, 1):
        pts = outline(sign)
        me = bpy.data.meshes.new("lens")
        me.from_pydata(pts, [], [list(range(len(pts)))])
        lens = link(bpy.data.objects.new("lens", me))
        lens.data.materials.append(lens_m)
        sol = lens.modifiers.new("s", "SOLIDIFY")
        sol.thickness = 0.0016
        lens.parent = root
        curve_tube("rim", pts, 0.0011, metal, cyclic=True).parent = root
        # つる（開いて後ろへ）
        x0 = sign * 0.062
        curve_tube("temple", [(x0, 0, 0.012), (x0 + sign * 0.006, 0.06, 0.012), (x0 + sign * 0.01, 0.12, 0.006),
                              (x0 + sign * 0.01, 0.135, -0.01)], 0.0012, metal).parent = root
    curve_tube("bridge", [(-0.009, 0, 0.012), (0, 0, 0.016), (0.009, 0, 0.012)], 0.0012, metal).parent = root
    curve_tube("bar", [(-0.03, 0, 0.022), (0, 0, 0.024), (0.03, 0, 0.022)], 0.0009, metal).parent = root
    root.location = loc
    root.rotation_euler = rot


def scene_reporter(sc) -> None:
    """机の上の持ち物: バケットハット・サングラス・灰皿のシガレットホルダー（煙）・グラス。"""
    world_color((0.0, 0.0, 0.0), 0.0)
    wood = mat("desk", (0.2, 0.11, 0.06), 0.35)
    noise_color(wood, (0.09, 0.045, 0.02), (0.26, 0.14, 0.07), 2.0, (1, 25, 1))
    prim("plane", "desk", wood, size=6, location=(0, 0, 0))
    # バケットハット
    canvas = mat("canvas", (0.42, 0.37, 0.27), 0.9)
    noise_bump(canvas, 300, 0.08)
    crown = prim("cylinder", "crown", canvas, radius=0.085, depth=0.075, vertices=64, location=(-0.17, 0.12, 0.062))
    crown.scale = (1, 1.08, 1)
    brim = prim("cone", "brim", canvas, radius1=0.15, radius2=0.088, depth=0.03, vertices=64, location=(-0.17, 0.12, 0.016))
    brim.scale = (1, 1.08, 1)
    brim.modifiers.new("s", "SOLIDIFY").thickness = 0.004
    band = mat("band", (0.12, 0.09, 0.06), 0.7)
    b = prim("cylinder", "band", band, radius=0.0865, depth=0.012, vertices=64, location=(-0.17, 0.12, 0.034))
    b.scale = (1, 1.08, 1)
    # サングラス（手前の主役）
    gold = mat("gold", (0.85, 0.65, 0.35), 0.18, metal=1.0)
    lens_m = mat("lens", (0.05, 0.06, 0.05), 0.02, metal=0.0)
    lens_m.node_tree.nodes["Principled BSDF"].inputs["Coat Weight"].default_value = 1.0
    aviators((0.02, -0.04, 0.024), (math.radians(-70), 0, math.radians(-18)), gold, lens_m)
    # ガラスの灰皿とシガレットホルダー
    glass = mat("glass", (1, 1, 1), 0.03, transmission=1.0, ior=1.5)
    tray = prim("cylinder", "tray", glass, radius=0.06, depth=0.025, vertices=64, location=(0.13, 0.03, 0.0125))
    tray.modifiers.new("s", "SOLIDIFY").thickness = 0.006
    black = mat("holder", (0.01, 0.01, 0.01), 0.15)
    silver = mat("silver", (0.8, 0.8, 0.82), 0.2, metal=1.0)
    ang = math.radians(12)
    hx, hz = 0.095, 0.03
    L = 0.14
    prim("cylinder", "holderbody", black, radius=0.0035, depth=L, vertices=16,
         location=(hx + math.cos(ang) * L / 2 - 0.07, 0.03, hz + math.sin(ang) * L / 2),
         rotation=(0, math.radians(90) - ang, 0))
    end_x = hx + math.cos(ang) * L - 0.07
    end_z = hz + math.sin(ang) * L
    prim("cylinder", "ring", silver, radius=0.0045, depth=0.008, vertices=16,
         location=(end_x, 0.03, end_z), rotation=(0, math.radians(90) - ang, 0))
    paper = mat("cig", (0.92, 0.9, 0.85), 0.6)
    cig_l = 0.05
    cx = end_x + math.cos(ang) * cig_l / 2
    cz = end_z + math.sin(ang) * cig_l / 2
    prim("cylinder", "cig", paper, radius=0.004, depth=cig_l, vertices=16, location=(cx, 0.03, cz),
         rotation=(0, math.radians(90) - ang, 0))
    tip = Vector((end_x + math.cos(ang) * cig_l, 0.03, end_z + math.sin(ang) * cig_l))
    prim("uv_sphere", "ember", emission("ember", (1.0, 0.32, 0.06), 30), radius=0.0042, location=tip,
         segments=16, ring_count=8)
    sm = smoke(tip + Vector((0, 0, 0.005)), height=0.35, density=160.0)
    sm.scale = (0.07, 0.07, 0.35)
    # 奥のグラス（ぼける）
    gl = prim("cylinder", "tumbler", glass, radius=0.04, depth=0.09, vertices=64, location=(0.26, 0.32, 0.045))
    gl.modifiers.new("s", "SOLIDIFY").thickness = 0.003
    liquor = mat("liquor", (1.0, 0.6, 0.25), 0.0, transmission=1.0, ior=1.36)
    prim("cylinder", "liq", liquor, radius=0.037, depth=0.035, vertices=64, location=(0.26, 0.32, 0.02))
    # 卓上ランプの光（左上）と、奥からの細い逆光
    light("SPOT", (-0.45, -0.15, 0.75), 60, (1.0, 0.76, 0.48), size=0.06, target=(0.03, 0.04, 0.0), spot=55)
    light("SPOT", (0.45, 0.8, 0.35), 18, (0.7, 0.8, 1.0), size=0.03, target=(0.12, 0.08, 0.1), spot=30)
    camera((-0.02, -0.44, 0.14), (0.06, 0.06, 0.06), lens=50, fstop=2.8, focus=0.42)


def scene_shadow(sc, frames: int) -> None:
    """裸電球が近づくにつれ、壁の影（帽子とホルダーの輪郭）が本人より大きくなっていく。"""
    world_color((0.0, 0.0, 0.0), 0.0)  # 霧は Remotion で重ねる（EEVEE の霧はこの環境だと格子のむらが出る）
    plaster = mat("plaster", (0.55, 0.5, 0.44), 0.95)
    noise_color(plaster, (0.42, 0.38, 0.33), (0.6, 0.55, 0.48), 4)
    noise_bump(plaster, 18, 0.25)
    wall = prim("plane", "wall", plaster, size=1, location=(0, 3.0, 3), rotation=(math.radians(90), 0, 0))
    wall.scale = (14, 6, 1)
    floor_m = mat("floor", (0.12, 0.1, 0.08), 0.7)
    noise_color(floor_m, (0.06, 0.05, 0.04), (0.16, 0.13, 0.1), 8, (1, 6, 1))
    prim("plane", "floor", floor_m, size=30, location=(0, 0, 0))
    cloth = mat("cloth", (0.004, 0.004, 0.004), 0.8)
    # 本人は横向き（光から見て横顔になる向き）。壁から 1.8m
    person("thompson", cloth, hat=True, glasses=True, holder=True, loc=(-0.4, 1.2, 0), rot_z=0.0)
    bulb = light("POINT", (-0.55, -2.8, 1.55), 120, (1.0, 0.78, 0.55), size=0.03)
    # 電球が本人に近づく（影が大きくなる）。壁の明るさが保たれるよう強さも変える
    for f, y, e in ((1, -2.8, 120), (int(frames * 0.15), -2.8, 120), (frames, 0.55, 22)):
        bulb.location.y = y
        bulb.data.energy = e
        bulb.keyframe_insert("location", frame=f)
        bulb.data.keyframe_insert("energy", frame=f)
    camera((1.9, -3.4, 1.35), (-0.2, 2.6, 2.1), lens=28)


def city_material() -> bpy.types.Material:
    """夜のビル: レンガ模様の1個ずつを窓に見立て、明るさの乱数でところどころ灯す。"""
    m = bpy.data.materials.new("city")
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (0.02, 0.022, 0.03, 1)
    b.inputs["Roughness"].default_value = 0.4
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    sxyz = nt.nodes.new("ShaderNodeSeparateXYZ")
    addxy = nt.nodes.new("ShaderNodeMath")
    addxy.operation = "ADD"
    comb = nt.nodes.new("ShaderNodeCombineXYZ")
    brick = nt.nodes.new("ShaderNodeTexBrick")
    brick.offset = 0.0
    brick.inputs["Scale"].default_value = 1.0
    brick.inputs["Mortar Size"].default_value = 0.35
    brick.inputs["Brick Width"].default_value = 1.6
    brick.inputs["Row Height"].default_value = 3.2
    brick.inputs["Bias"].default_value = 0.0
    brick.inputs["Color1"].default_value = (0, 0, 0, 1)  # 1個ずつ Color1〜Color2 の間の乱数になる
    brick.inputs["Color2"].default_value = (1, 1, 1, 1)
    brick.inputs["Mortar"].default_value = (0, 0, 0, 1)
    sep = nt.nodes.new("ShaderNodeSeparateColor")
    on = nt.nodes.new("ShaderNodeMath")
    on.operation = "GREATER_THAN"
    on.inputs[1].default_value = 0.8
    not_mortar = nt.nodes.new("ShaderNodeMath")
    not_mortar.operation = "SUBTRACT"
    not_mortar.inputs[0].default_value = 1.0
    mask = nt.nodes.new("ShaderNodeMath")
    mask.operation = "MULTIPLY"
    strength = nt.nodes.new("ShaderNodeMath")
    strength.operation = "MULTIPLY"
    strength.inputs[1].default_value = 2.5
    tint = nt.nodes.new("ShaderNodeMix")
    tint.data_type = "RGBA"
    tint.inputs["A"].default_value = (1.0, 0.72, 0.42, 1)
    tint.inputs["B"].default_value = (0.75, 0.85, 1.0, 1)
    L = nt.links.new
    L(geo.outputs["Position"], sxyz.inputs["Vector"])
    L(sxyz.outputs["X"], addxy.inputs[0])
    L(sxyz.outputs["Y"], addxy.inputs[1])
    L(addxy.outputs["Value"], comb.inputs["X"])
    L(sxyz.outputs["Z"], comb.inputs["Y"])
    L(comb.outputs["Vector"], brick.inputs["Vector"])
    L(brick.outputs["Color"], sep.inputs["Color"])
    L(sep.outputs["Red"], on.inputs[0])
    L(brick.outputs["Fac"], not_mortar.inputs[1])
    L(on.outputs["Value"], mask.inputs[0])
    L(not_mortar.outputs["Value"], mask.inputs[1])
    L(mask.outputs["Value"], strength.inputs[0])
    L(sep.outputs["Red"], tint.inputs["Factor"])
    L(tint.outputs["Result"], b.inputs["Emission Color"])
    L(strength.outputs["Value"], b.inputs["Emission Strength"])
    return m


def scene_window(sc) -> None:
    """夜の高層階。窓辺に立つ現代の男の後ろ姿と、ぼけた街の灯り。"""
    world_color((0.01, 0.015, 0.03), 1.0)
    city = city_material()
    rnd = random.Random(12)
    for i in range(140):
        x = rnd.uniform(-260, 260)
        y = rnd.uniform(110, 600)
        h = rnd.uniform(20, 140)
        bld = prim("cube", f"bld{i}", city, size=1, location=(x, y, h / 2 - 60))
        bld.scale = (rnd.uniform(12, 30), rnd.uniform(12, 30), h)
    street = emission("street", (1.0, 0.6, 0.3), 3.0)
    for i in range(30):
        s = prim("cube", f"st{i}", street, size=1, location=(rnd.uniform(-150, 150), rnd.uniform(30, 400), -60))
        s.scale = (rnd.uniform(60, 200), 0.6, 0.3)
    # 室内: 床・窓枠・ガラス
    inside = mat("inside", (0.03, 0.03, 0.035), 0.5)
    prim("plane", "floor", inside, size=20, location=(0, 0, 0))
    frame_m = mat("frame", (0.02, 0.02, 0.022), 0.3, metal=0.6)
    for x in (-2.4, -0.8, 0.8, 2.4):
        prim("cube", f"mull{x}", frame_m, size=1, location=(x, 2.0, 1.6)).scale = (0.06, 0.08, 3.2)
    prim("cube", "sill", frame_m, size=1, location=(0, 2.0, 0.05)).scale = (6, 0.1, 0.1)
    cloth = mat("cloth", (0.015, 0.015, 0.018), 0.7)
    person("me", cloth, arms="pockets", loc=(0.35, 1.35, 0), rot_z=math.radians(90))
    light("AREA", (0.3, 3.5, 2.5), 60, (0.7, 0.8, 1.0), size=3, target=(0.3, 1.3, 1.4))
    camera((-0.9, -2.2, 1.5), (0.4, 2.5, 1.35), lens=40, fstop=1.4, focus=3.75)


def scene_strings(sc) -> None:
    """闇の中、上からの光に照らされて立つ木の操り人形。手首・肩・頭から糸が十字の板へ。"""
    world_color((0.0, 0.0, 0.0), 0.0)  # 光の筋は Remotion で重ねる
    floor_m = mat("floor", (0.03, 0.03, 0.03), 0.22)
    prim("plane", "floor", floor_m, size=40, location=(0, 0, 0))
    wood = mat("puppetwood", (0.55, 0.36, 0.2), 0.45)
    noise_color(wood, (0.42, 0.26, 0.13), (0.66, 0.45, 0.26), 3.0, (1, 1, 12))
    wood.node_tree.nodes["Principled BSDF"].inputs["Coat Weight"].default_value = 0.6
    person("me", wood, arms="raised", loc=(0, 0, 0), rot_z=math.radians(-90))
    # 糸: 手首・両肩・頭から、上の一点（操り手）へ
    thread = mat("thread", (0.9, 0.9, 0.85), 0.25, emit=(1.0, 0.95, 0.85), emit_strength=0.6)
    top = Vector((0.0, 0.0, 3.3))
    # 操り手の十字の板
    bar = mat("bar", (0.35, 0.22, 0.12), 0.5)
    prim("cube", "barx", bar, size=1, location=(0, 0, 3.3)).scale = (0.08, 0.9, 0.05)
    prim("cube", "bary", bar, size=1, location=(0, 0, 3.3)).scale = (0.7, 0.08, 0.05)
    anchors = [(0.0, -0.46, 0.86), (0.0, 0.46, 0.86), (0.0, -0.2, 1.47), (0.0, 0.2, 1.47), (0.0, 0.0, 1.78)]
    # rot_z=-90 で人物を回したので、取り付け点も回す
    rot = Euler((0, 0, math.radians(-90)))
    tops = [Vector((0, -0.42, 3.27)), Vector((0, 0.42, 3.27)), Vector((-0.3, 0, 3.27)), Vector((0.3, 0, 3.27)),
            Vector((0, 0, 3.27))]
    for i, a in enumerate(anchors):
        p = Vector(a)
        p.rotate(rot)
        d = tops[i] - p
        mid = p + d / 2
        t = prim("cylinder", f"thread{i}", thread, radius=0.0016, depth=d.length, vertices=8, location=mid)
        t.rotation_euler = d.to_track_quat("Z", "Y").to_euler()
    light("SPOT", (0.6, -1.2, 6.5), 2200, (1.0, 0.9, 0.75), size=0.2, target=(0, 0, 0.9), spot=24)
    light("AREA", (0.0, 4.0, 1.5), 40, (0.6, 0.7, 1.0), size=2, target=(0, 0, 1.2))
    camera((0.0, -5.9, 1.0), (0.0, 0.0, 1.7), lens=32)


CYCLES_SCENES = {"derby", "reporter"}  # ガラスの屈折が要る場面だけ Cycles（ほかは EEVEE で速く）

SCENES = {
    "louisville": scene_louisville,
    "derby": scene_derby,
    "reporter": scene_reporter,
    "window": scene_window,
    "strings": scene_strings,
}


def configure(sc, engine: str, size, samples: int, pct: int) -> None:
    r = sc.render
    r.engine = "CYCLES" if engine == "cycles" else "BLENDER_EEVEE"
    r.resolution_x, r.resolution_y = size
    r.resolution_percentage = pct
    r.image_settings.file_format = "PNG"
    r.film_transparent = False
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Medium High Contrast"
    if engine == "cycles":
        c = sc.cycles
        c.device = "CPU"
        c.samples = samples
        c.use_adaptive_sampling = True
        c.use_denoising = True
        c.denoiser = "OPENIMAGEDENOISE"
        c.max_bounces = 8
        c.transmission_bounces = 8
        c.volume_bounces = 0
        c.volume_step_rate = 4.0
    else:
        e = sc.eevee
        e.taa_render_samples = samples
        for k, v in (("bokeh_max_size", 400.0), ("use_volumetric_shadows", True), ("volumetric_tile_size", "2"), ("volumetric_samples", 64),
                     ("volumetric_end", 200.0), ("use_shadows", True)):
            if hasattr(e, k):
                try:
                    setattr(e, k, v)
                except Exception as ex:  # 版によって無い設定がある
                    print("eevee setting skipped:", k, ex)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--scene", required=True, choices=sorted([*SCENES, "shadow"]))
    ap.add_argument("--preview", action="store_true", help="25% の大きさ・少ないサンプルで試す")
    ap.add_argument("--samples", type=int)
    ap.add_argument("--frames", type=int, nargs=2)
    ap.add_argument("--save-blend", action="store_true")
    args = ap.parse_args()

    sc = reset()
    OUT.mkdir(parents=True, exist_ok=True)
    t0 = time.perf_counter()
    if args.scene == "shadow":
        frames = int(6 * FPS)
        sc.frame_start, sc.frame_end = 1, frames
        scene_shadow(sc, frames)
        configure(sc, "eevee", ANIM_SIZE, args.samples or (4 if args.preview else 8), 50 if args.preview else 100)
        out_dir = OUT / "k_shadow"
        out_dir.mkdir(parents=True, exist_ok=True)
        start, end = args.frames or (1, frames)
        for f in range(start, end + 1):
            sc.frame_set(f)
            sc.render.filepath = str(out_dir / f"{f:04d}.png")
            bpy.ops.render.render(write_still=True)
            print(f"[shadow] frame {f}/{end} {time.perf_counter() - t0:.1f}s", flush=True)
    else:
        SCENES[args.scene](sc)
        if args.scene in CYCLES_SCENES:
            configure(sc, "cycles", STILL_SIZE, args.samples or (16 if args.preview else 64), 25 if args.preview else 100)
        else:
            configure(sc, "eevee", STILL_SIZE, args.samples or (8 if args.preview else 16), 33 if args.preview else 100)
        suffix = "_preview" if args.preview else ""
        sc.render.filepath = str(OUT / f"k_{args.scene}{suffix}.png")
        bpy.ops.render.render(write_still=True)
    if args.save_blend:
        bpy.ops.wm.save_as_mainfile(filepath=str(OUT / f"k_{args.scene}.blend"))
    print(f"done {args.scene} in {time.perf_counter() - t0:.1f}s")
    return 0


if __name__ == "__main__":
    sys.exit(main())
