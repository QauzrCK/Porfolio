import bpy
import math
import sys
import os

# Parse command line arguments for output path
argv = sys.argv
if "--" in argv:
    args = argv[argv.index("--") + 1:]
else:
    args = []

output_path = "public/models/electrical_panel.glb"
for i in range(len(args)):
    if args[i] == "--out" and i + 1 < len(args):
        output_path = args[i + 1]

os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
print(f"Building detailed openable 3D Electrical Control Panel -> {output_path}")

# Reset to clean empty scene
bpy.ops.wm.read_factory_settings(use_empty=True)


def create_mat(name, base_color, metallic=0.0, roughness=0.5, emission=None, emission_strength=1.0, transmission=0.0, alpha=1.0):
    mat = bpy.data.materials.new(name=name)
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = base_color
        if "Metallic" in bsdf.inputs:
            bsdf.inputs["Metallic"].default_value = metallic
        if "Roughness" in bsdf.inputs:
            bsdf.inputs["Roughness"].default_value = roughness
        if "Alpha" in bsdf.inputs:
            bsdf.inputs["Alpha"].default_value = alpha
        if emission:
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = emission
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = emission_strength
        if transmission > 0:
            if "Transmission Weight" in bsdf.inputs:
                bsdf.inputs["Transmission Weight"].default_value = transmission
            if "IOR" in bsdf.inputs:
                bsdf.inputs["IOR"].default_value = 1.49
    return mat


# --- PBR Materials ---
mat_enclosure = create_mat("M_Enclosure_Steel", (0.70, 0.72, 0.74, 1.0), metallic=0.35, roughness=0.36)
mat_inner_plate = create_mat("M_Galvanized_Backplate", (0.64, 0.66, 0.68, 1.0), metallic=0.82, roughness=0.26)
mat_dark_frame = create_mat("M_Dark_Anodized", (0.11, 0.13, 0.16, 1.0), metallic=0.35, roughness=0.45)
mat_wire_duct = create_mat("M_WireDuct_Grey", (0.26, 0.29, 0.34, 1.0), metallic=0.05, roughness=0.58)
mat_chrome = create_mat("M_Chrome", (0.94, 0.94, 0.95, 1.0), metallic=0.98, roughness=0.12)
mat_rubber = create_mat("M_Rubber_Gasket", (0.05, 0.05, 0.06, 1.0), metallic=0.0, roughness=0.85)
mat_glass = create_mat("M_Acrylic_Glass", (0.88, 0.94, 1.0, 1.0), metallic=0.05, roughness=0.04, transmission=0.92, alpha=0.25)

mat_breaker_red = create_mat("M_Breaker_Red", (0.86, 0.10, 0.10, 1.0), metallic=0.1, roughness=0.32)
mat_yellow_safety = create_mat("M_Yellow_Safety", (0.95, 0.76, 0.04, 1.0), metallic=0.08, roughness=0.38)
mat_estop_red = create_mat("M_EStop_Red", (0.90, 0.05, 0.05, 1.0), metallic=0.05, roughness=0.28)
mat_knob_black = create_mat("M_Matte_Plastic", (0.09, 0.10, 0.12, 1.0), metallic=0.1, roughness=0.55)
mat_white_stripe = create_mat("M_White_Marker", (0.95, 0.95, 0.95, 1.0), metallic=0.0, roughness=0.4)
mat_start_green = create_mat("M_Start_Green", (0.07, 0.66, 0.22, 1.0), metallic=0.1, roughness=0.32)

mat_led_pwr = create_mat("M_LED_Power", (0.10, 0.88, 0.28, 1.0), metallic=0.05, roughness=0.18, emission=(0.15, 1.0, 0.32, 1.0), emission_strength=3.0)
mat_led_flt = create_mat("M_LED_Fault", (0.95, 0.12, 0.12, 1.0), metallic=0.05, roughness=0.18, emission=(1.0, 0.10, 0.10, 1.0), emission_strength=3.0)

mat_dial_face = create_mat("M_Dial_Face", (0.96, 0.96, 0.94, 1.0), metallic=0.02, roughness=0.55)
mat_tick_dark = create_mat("M_Dial_Ticks", (0.08, 0.09, 0.11, 1.0), metallic=0.1, roughness=0.5)
mat_needle = create_mat("M_Needle_Red", (0.85, 0.08, 0.08, 1.0), metallic=0.2, roughness=0.3)

mat_plc_body = create_mat("M_PLC_Body", (0.14, 0.16, 0.20, 1.0), metallic=0.15, roughness=0.42)
mat_plc_accent = create_mat("M_PLC_Accent", (0.05, 0.55, 0.65, 1.0), metallic=0.2, roughness=0.35)
mat_plc_term = create_mat("M_PLC_Terminal", (0.14, 0.45, 0.24, 1.0), metallic=0.08, roughness=0.5)
mat_plc_led = create_mat("M_PLC_LED", (0.20, 0.95, 0.35, 1.0), metallic=0.0, roughness=0.2, emission=(0.20, 1.0, 0.40, 1.0), emission_strength=3.5)

mat_fan_frame = create_mat("M_Fan_Frame", (0.10, 0.11, 0.13, 1.0), metallic=0.2, roughness=0.5)
mat_fan_blades = create_mat("M_Fan_Blades", (0.20, 0.22, 0.26, 1.0), metallic=0.35, roughness=0.38)

# Interior component materials (for show)
mat_mcb_white = create_mat("M_MCB_White", (0.88, 0.89, 0.91, 1.0), metallic=0.05, roughness=0.45)
mat_mcb_blue = create_mat("M_MCB_Blue", (0.08, 0.42, 0.82, 1.0), metallic=0.05, roughness=0.4)
mat_contactor_grey = create_mat("M_Contactor_Grey", (0.22, 0.24, 0.28, 1.0), metallic=0.1, roughness=0.5)
mat_copper = create_mat("M_Copper_Busbar", (0.85, 0.45, 0.20, 1.0), metallic=0.92, roughness=0.22)
mat_wire_red = create_mat("M_Wire_Red", (0.82, 0.12, 0.12, 1.0), metallic=0.05, roughness=0.45)
mat_wire_blue = create_mat("M_Wire_Blue", (0.12, 0.38, 0.85, 1.0), metallic=0.05, roughness=0.45)
mat_wire_black = create_mat("M_Wire_Black", (0.06, 0.06, 0.08, 1.0), metallic=0.05, roughness=0.5)
mat_wire_earth = create_mat("M_Wire_Earth", (0.25, 0.72, 0.18, 1.0), metallic=0.05, roughness=0.45)


def join_to(source, target):
    bpy.ops.object.select_all(action='DESELECT')
    source.select_set(True)
    target.select_set(True)
    bpy.context.view_layer.objects.active = target
    bpy.ops.object.join()


def bool_cut(target, cutter):
    mod = target.modifiers.new(name="BoolCut", type='BOOLEAN')
    mod.operation = 'DIFFERENCE'
    mod.solver = 'EXACT'
    mod.object = cutter
    bpy.context.view_layer.objects.active = target
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(cutter, do_unlink=True)


def add_bevel(obj, width=0.004, segments=2):
    mod = obj.modifiers.new("Bevel", "BEVEL")
    mod.width = width
    mod.segments = segments
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=mod.name)
    # Keep flat faces crisp without warped normal interpolation
    for poly in obj.data.polygons:
        poly.use_smooth = False


# =============================================================
# 1. CABINET BODY (cabinet_body) — Open-front enclosure shell
# =============================================================
# Outer shell: 0.76m W x 0.24m D x 1.04m H, centered at Y = +0.01 (front opening at Y = -0.11)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0.01, 0))
cabinet_body = bpy.context.active_object
cabinet_body.name = "cabinet_body"
cabinet_body.scale = (0.76, 0.24, 1.04)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
cabinet_body.data.materials.append(mat_enclosure)

# Hollow out the entire front/interior cavity
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -0.005, 0.0))
body_cavity = bpy.context.active_object
body_cavity.scale = (0.70, 0.22, 0.98)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
bool_cut(cabinet_body, body_cavity)

# Cut side ventilation opening for cooling_fan at X = +0.38
bpy.ops.mesh.primitive_cylinder_add(radius=0.068, depth=0.06, location=(0.37, 0.0, -0.10), rotation=(0, math.pi / 2, 0))
fan_cutter = bpy.context.active_object
bool_cut(cabinet_body, fan_cutter)

add_bevel(cabinet_body, width=0.006, segments=2)

# Inner rubber door seal gasket along cabinet front lip
seal_parts = [
    ((0.0, -0.112, 0.495), (0.72, 0.008, 0.014)),
    ((0.0, -0.112, -0.495), (0.72, 0.008, 0.014)),
    ((-0.354, -0.112, 0.0), (0.014, 0.008, 1.00)),
    ((0.354, -0.112, 0.0), (0.014, 0.008, 1.00)),
]
for loc, scl in seal_parts:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
    sp = bpy.context.active_object
    sp.scale = scl
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    sp.data.materials.append(mat_rubber)
    join_to(sp, cabinet_body)

# Top drip canopy
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.01, 0.528))
canopy = bpy.context.active_object
canopy.scale = (0.79, 0.30, 0.022)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
add_bevel(canopy, width=0.004, segments=2)
canopy.data.materials.append(mat_dark_frame)
join_to(canopy, cabinet_body)

# Bottom cable glands (4x)
for gx in [-0.24, -0.08, 0.08, 0.24]:
    bpy.ops.mesh.primitive_cylinder_add(radius=0.018, depth=0.036, location=(gx, 0.02, -0.535))
    gland = bpy.context.active_object
    gland.data.materials.append(mat_dark_frame)
    join_to(gland, cabinet_body)

# Fan outer bezel + protective grille attached to cabinet_body
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.382, 0.0, -0.10))
fan_cowl = bpy.context.active_object
fan_cowl.scale = (0.012, 0.165, 0.165)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
add_bevel(fan_cowl, width=0.003, segments=2)
fan_cowl.data.materials.append(mat_fan_frame)

bpy.ops.mesh.primitive_cylinder_add(radius=0.068, depth=0.03, location=(0.382, 0.0, -0.10), rotation=(0, math.pi / 2, 0))
cowl_hole = bpy.context.active_object
bool_cut(fan_cowl, cowl_hole)
join_to(fan_cowl, cabinet_body)

for g_off in [-0.048, -0.024, 0.0, 0.024, 0.048]:
    bpy.ops.mesh.primitive_cylinder_add(radius=0.0018, depth=0.14, location=(0.390, 0.0, -0.10 + g_off), rotation=(math.pi / 2, 0, 0))
    grille = bpy.context.active_object
    grille.data.materials.append(mat_chrome)
    join_to(grille, cabinet_body)


# =============================================================
# 2. DETAILED INTERIOR (interior_props) — Purely for show
# =============================================================
# Full-height galvanized mounting backplate
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.085, 0.0))
interior = bpy.context.active_object
interior.name = "interior_props"
interior.scale = (0.64, 0.012, 0.90)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
interior.data.materials.append(mat_inner_plate)

# 3 Horizontal DIN Rails (Top for PLC, Middle for Breakers/Contactors, Bottom for Terminals)
for rz in [0.24, -0.04, -0.30]:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.072, rz))
    din = bpy.context.active_object
    din.scale = (0.54, 0.012, 0.036)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    din.data.materials.append(mat_chrome)
    join_to(din, interior)

# Horizontal & Vertical Slotted Wire Ducts (Cable Management)
for dz in [0.39, 0.11, -0.17, -0.40]:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.062, dz))
    duct = bpy.context.active_object
    duct.scale = (0.56, 0.042, 0.038)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    duct.data.materials.append(mat_wire_duct)
    join_to(duct, interior)

for dx in [-0.295, 0.295]:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(dx, 0.062, 0.0))
    vduct = bpy.context.active_object
    vduct.scale = (0.038, 0.042, 0.82)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    vduct.data.materials.append(mat_wire_duct)
    join_to(vduct, interior)

# 24V DC Industrial Power Supply (Top Left next to PLC)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-0.20, 0.035, 0.24))
psu = bpy.context.active_object
psu.scale = (0.09, 0.07, 0.125)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
add_bevel(psu, width=0.002, segments=2)
psu.data.materials.append(mat_chrome)
join_to(psu, interior)

# Row of 6 Miniature Circuit Breakers (MCBs) on Middle DIN Rail (left half)
for i in range(6):
    mx = -0.23 + i * 0.034
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(mx, 0.038, -0.04))
    mcb = bpy.context.active_object
    mcb.scale = (0.030, 0.060, 0.095)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    mcb.data.materials.append(mat_mcb_white)
    join_to(mcb, interior)

    # Blue toggle switch on each MCB
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(mx, 0.004, -0.035))
    tog = bpy.context.active_object
    tog.scale = (0.018, 0.014, 0.012)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    tog.data.materials.append(mat_mcb_blue)
    join_to(tog, interior)

# 2x 3-Phase Industrial Contactors on Middle DIN Rail (right half)
for cx in [0.07, 0.18]:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(cx, 0.030, -0.04))
    cont = bpy.context.active_object
    cont.scale = (0.075, 0.080, 0.105)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    add_bevel(cont, width=0.002, segments=2)
    cont.data.materials.append(mat_contactor_grey)
    join_to(cont, interior)

    # Copper terminal lugs top/bottom
    for tz in [-0.045, 0.045]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(cx, 0.035, -0.04 + tz))
        lug = bpy.context.active_object
        lug.scale = (0.060, 0.025, 0.014)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        lug.data.materials.append(mat_copper)
        join_to(lug, interior)

# Row of DIN-Rail Terminal Blocks on Bottom Rail
for i in range(14):
    tx = -0.22 + i * 0.032
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(tx, 0.052, -0.30))
    tb = bpy.context.active_object
    tb.scale = (0.024, 0.045, 0.055)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    tb.data.materials.append(mat_wire_earth if i >= 12 else (mat_mcb_blue if i >= 10 else mat_mcb_white))
    join_to(tb, interior)

# Color-coded 3-phase & control vertical wiring drops
wire_specs = [
    (-0.21, 0.025, 0.03, 0.14, mat_wire_red),
    (-0.18, 0.025, 0.03, 0.14, mat_wire_black),
    (-0.15, 0.025, 0.03, 0.14, mat_wire_blue),
    (0.05, 0.025, -0.17, 0.18, mat_wire_red),
    (0.07, 0.025, -0.17, 0.18, mat_wire_black),
    (0.09, 0.025, -0.17, 0.18, mat_wire_blue),
    (0.18, 0.025, -0.17, 0.18, mat_wire_earth),
]
for wx, wy, wz, wh, wmat in wire_specs:
    bpy.ops.mesh.primitive_cylinder_add(radius=0.0045, depth=wh, location=(wx, wy, wz))
    wire = bpy.context.active_object
    wire.data.materials.append(wmat)
    join_to(wire, interior)


# =============================================================
# 3. HINGED FRONT DOOR (enclosure_door)
# =============================================================
# Door slab: 0.74m W x 0.024m D x 1.01m H, front face at Y = -0.132, back at Y = -0.108
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.120, 0))
door = bpy.context.active_object
door.name = "enclosure_door"
door.scale = (0.74, 0.024, 1.01)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
door.data.materials.append(mat_enclosure)

# Cut viewing window opening through the door
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -0.120, 0.24))
win_cutter = bpy.context.active_object
win_cutter.scale = (0.48, 0.06, 0.30)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
bool_cut(door, win_cutter)

add_bevel(door, width=0.005, segments=2)

# Viewing window rubber gasket frame on door
gasket_parts = [
    ((0.0, -0.132, 0.395), (0.51, 0.010, 0.016)),
    ((0.0, -0.132, 0.085), (0.51, 0.010, 0.016)),
    ((-0.247, -0.132, 0.24), (0.016, 0.010, 0.326)),
    ((0.247, -0.132, 0.24), (0.016, 0.010, 0.326)),
]
for loc, scl in gasket_parts:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
    gp = bpy.context.active_object
    gp.scale = scl
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    gp.data.materials.append(mat_rubber)
    join_to(gp, door)

# Left-side heavy-duty barrel hinges
for hz in [-0.34, 0.0, 0.34]:
    bpy.ops.mesh.primitive_cylinder_add(radius=0.014, depth=0.07, location=(-0.375, -0.118, hz))
    hinge = bpy.context.active_object
    hinge.data.materials.append(mat_chrome)
    join_to(hinge, door)

# Right-side quarter-turn latch
bpy.ops.mesh.primitive_cylinder_add(radius=0.020, depth=0.016, location=(0.315, -0.135, -0.02), rotation=(math.pi / 2, 0, 0))
latch = bpy.context.active_object
latch.data.materials.append(mat_chrome)
join_to(latch, door)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.315, -0.144, -0.02))
latch_slot = bpy.context.active_object
latch_slot.scale = (0.005, 0.006, 0.024)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
latch_slot.data.materials.append(mat_dark_frame)
join_to(latch_slot, door)

# Top nameplate & yellow badge
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-0.15, -0.132, 0.445))
name_plate = bpy.context.active_object
name_plate.scale = (0.28, 0.005, 0.045)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
name_plate.data.materials.append(mat_dark_frame)
join_to(name_plate, door)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.20, -0.132, 0.445))
warn_plate = bpy.context.active_object
warn_plate.scale = (0.12, 0.005, 0.045)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
warn_plate.data.materials.append(mat_yellow_safety)
join_to(warn_plate, door)

# Window glass pane (separate non-blocking mesh)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -0.122, 0.24))
glass_pane = bpy.context.active_object
glass_pane.name = "enclosure_window_glass"
glass_pane.scale = (0.48, 0.004, 0.30)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
glass_pane.data.materials.append(mat_glass)


# =============================================================
# 4. PLC CONTROLLER MODULE (plc_controller) — Mounted inside cabinet
# =============================================================
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.04, 0.035, 0.24))
plc = bpy.context.active_object
plc.name = "plc_controller"
plc.scale = (0.24, 0.065, 0.145)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
add_bevel(plc, width=0.003, segments=2)
plc.data.materials.append(mat_plc_body)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.04, 0.002, 0.24))
plc_face = bpy.context.active_object
plc_face.scale = (0.22, 0.004, 0.09)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
plc_face.data.materials.append(mat_plc_accent)
join_to(plc_face, plc)

for z_off in [-0.068, 0.068]:
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.04, 0.012, 0.24 + z_off))
    term = bpy.context.active_object
    term.scale = (0.21, 0.025, 0.018)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    term.data.materials.append(mat_plc_term)
    join_to(term, plc)

for idx in range(8):
    x_pos = 0.04 - 0.075 + idx * 0.021
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x_pos, -0.001, 0.265))
    pled = bpy.context.active_object
    pled.scale = (0.007, 0.004, 0.010)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    pled.data.materials.append(mat_plc_led)
    join_to(pled, plc)


# =============================================================
# 5. ANALOG GAUGES (gauge_voltmeter, gauge_ammeter)
# =============================================================
def build_gauge(name, x_pos, z_pos):
    bpy.ops.mesh.primitive_cylinder_add(radius=0.066, depth=0.026, location=(x_pos, -0.136, z_pos), rotation=(math.pi / 2, 0, 0))
    bezel = bpy.context.active_object
    bezel.name = name
    bezel.data.materials.append(mat_dark_frame)

    bpy.ops.mesh.primitive_torus_add(major_radius=0.063, minor_radius=0.005, location=(x_pos, -0.149, z_pos), rotation=(math.pi / 2, 0, 0))
    rim = bpy.context.active_object
    rim.data.materials.append(mat_chrome)
    join_to(rim, bezel)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.059, depth=0.003, location=(x_pos, -0.145, z_pos), rotation=(math.pi / 2, 0, 0))
    face = bpy.context.active_object
    face.data.materials.append(mat_dial_face)
    join_to(face, bezel)

    hub_z = z_pos - 0.016
    for step in range(11):
        frac = step / 10.0
        angle = math.radians(-50 + frac * 100)
        is_major = (step % 2 == 0)
        r_tick = 0.044 if is_major else 0.046
        tx = x_pos + r_tick * math.sin(angle)
        tz = hub_z + r_tick * math.cos(angle)
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(tx, -0.147, tz), rotation=(0, angle, 0))
        tick = bpy.context.active_object
        tick.scale = (0.0022 if is_major else 0.0012, 0.002, 0.008 if is_major else 0.005)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        tick.data.materials.append(mat_tick_dark)
        join_to(tick, bezel)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.007, depth=0.008, location=(x_pos, -0.149, hub_z), rotation=(math.pi / 2, 0, 0))
    hub = bpy.context.active_object
    hub.data.materials.append(mat_dark_frame)
    join_to(hub, bezel)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x_pos, -0.149, hub_z + 0.019))
    needle_obj = bpy.context.active_object
    needle_obj.name = f"{name}_needle"
    needle_obj.scale = (0.0022, 0.0015, 0.044)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    needle_obj.data.materials.append(mat_needle)

    bpy.context.scene.cursor.location = (x_pos, -0.149, hub_z)
    bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
    needle_obj.parent = bezel

    bpy.ops.mesh.primitive_cylinder_add(radius=0.060, depth=0.002, location=(x_pos, -0.152, z_pos), rotation=(math.pi / 2, 0, 0))
    mglass = bpy.context.active_object
    mglass.name = f"{name}_glass"
    mglass.data.materials.append(mat_glass)
    mglass.parent = bezel


build_gauge("gauge_voltmeter", -0.15, -0.02)
build_gauge("gauge_ammeter", 0.15, -0.02)


# =============================================================
# 6. MAIN BREAKER ROTARY LEVER (main_breaker)
# =============================================================
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-0.25, -0.135, -0.26))
brk_plate = bpy.context.active_object
brk_plate.scale = (0.095, 0.012, 0.095)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
add_bevel(brk_plate, width=0.004, segments=2)
brk_plate.data.materials.append(mat_yellow_safety)
join_to(brk_plate, door)

bpy.ops.mesh.primitive_cylinder_add(radius=0.028, depth=0.026, location=(-0.25, -0.152, -0.26), rotation=(math.pi / 2, 0, 0))
handle_obj = bpy.context.active_object
handle_obj.name = "main_breaker"
handle_obj.data.materials.append(mat_breaker_red)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-0.25, -0.158, -0.218))
handle_bar = bpy.context.active_object
handle_bar.scale = (0.022, 0.020, 0.072)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
add_bevel(handle_bar, width=0.003, segments=2)
handle_bar.data.materials.append(mat_breaker_red)
join_to(handle_bar, handle_obj)

bpy.context.scene.cursor.location = (-0.25, -0.152, -0.26)
bpy.ops.object.origin_set(type='ORIGIN_CURSOR')


# =============================================================
# 7. EMERGENCY STOP BUTTON (emergency_stop)
# =============================================================
bpy.ops.mesh.primitive_cylinder_add(radius=0.052, depth=0.008, location=(0.25, -0.134, -0.26), rotation=(math.pi / 2, 0, 0))
estop_plate = bpy.context.active_object
estop_plate.data.materials.append(mat_yellow_safety)
join_to(estop_plate, door)

bpy.ops.mesh.primitive_cylinder_add(radius=0.016, depth=0.024, location=(0.25, -0.145, -0.26), rotation=(math.pi / 2, 0, 0))
estop_obj = bpy.context.active_object
estop_obj.name = "emergency_stop"
estop_obj.data.materials.append(mat_estop_red)

bpy.ops.mesh.primitive_cylinder_add(radius=0.039, depth=0.020, location=(0.25, -0.158, -0.26), rotation=(math.pi / 2, 0, 0))
estop_head = bpy.context.active_object
add_bevel(estop_head, width=0.005, segments=3)
estop_head.data.materials.append(mat_estop_red)
join_to(estop_head, estop_obj)

bpy.context.scene.cursor.location = (0.25, -0.145, -0.26)
bpy.ops.object.origin_set(type='ORIGIN_CURSOR')


# =============================================================
# 8. SELECTOR SWITCH (selector_switch)
# =============================================================
bpy.ops.mesh.primitive_cylinder_add(radius=0.034, depth=0.014, location=(0.0, -0.136, -0.26), rotation=(math.pi / 2, 0, 0))
sel_bezel = bpy.context.active_object
sel_bezel.data.materials.append(mat_dark_frame)
join_to(sel_bezel, door)

for deg in [-45, 0, 45]:
    ang = math.radians(deg)
    mx = 0.030 * math.sin(ang)
    mz = -0.26 + 0.030 * math.cos(ang)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(mx, -0.143, mz), rotation=(0, ang, 0))
    mkr = bpy.context.active_object
    mkr.scale = (0.003, 0.003, 0.008)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    mkr.data.materials.append(mat_white_stripe)
    join_to(mkr, door)

bpy.ops.mesh.primitive_cylinder_add(radius=0.023, depth=0.020, location=(0.0, -0.146, -0.26), rotation=(math.pi / 2, 0, 0))
knob_obj = bpy.context.active_object
knob_obj.name = "selector_switch"
knob_obj.data.materials.append(mat_knob_black)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -0.154, -0.244))
knob_bar = bpy.context.active_object
knob_bar.scale = (0.010, 0.016, 0.036)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
add_bevel(knob_bar, width=0.002, segments=2)
knob_bar.data.materials.append(mat_knob_black)
join_to(knob_bar, knob_obj)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, -0.163, -0.236))
knob_stripe = bpy.context.active_object
knob_stripe.scale = (0.003, 0.002, 0.018)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
knob_stripe.data.materials.append(mat_white_stripe)
join_to(knob_stripe, knob_obj)

bpy.context.scene.cursor.location = (0.0, -0.146, -0.26)
bpy.ops.object.origin_set(type='ORIGIN_CURSOR')


# =============================================================
# 9. PUSH BUTTON START (push_button_start)
# =============================================================
bpy.ops.mesh.primitive_torus_add(major_radius=0.026, minor_radius=0.004, location=(0.125, -0.138, -0.26), rotation=(math.pi / 2, 0, 0))
start_bezel = bpy.context.active_object
start_bezel.data.materials.append(mat_chrome)
join_to(start_bezel, door)

bpy.ops.mesh.primitive_cylinder_add(radius=0.022, depth=0.016, location=(0.125, -0.144, -0.26), rotation=(math.pi / 2, 0, 0))
btn_start = bpy.context.active_object
btn_start.name = "push_button_start"
add_bevel(btn_start, width=0.002, segments=2)
btn_start.data.materials.append(mat_start_green)

bpy.context.scene.cursor.location = (0.125, -0.144, -0.26)
bpy.ops.object.origin_set(type='ORIGIN_CURSOR')


# =============================================================
# 10. INDICATOR LEDS (indicator_led_power, indicator_led_fault)
# =============================================================
for led_name, lz, lmat in [
    ("indicator_led_power", -0.22, mat_led_pwr),
    ("indicator_led_fault", -0.29, mat_led_flt),
]:
    bpy.ops.mesh.primitive_torus_add(major_radius=0.017, minor_radius=0.003, location=(-0.125, -0.136, lz), rotation=(math.pi / 2, 0, 0))
    lbez = bpy.context.active_object
    lbez.data.materials.append(mat_chrome)
    join_to(lbez, door)

    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.014, location=(-0.125, -0.142, lz))
    lens = bpy.context.active_object
    lens.name = led_name
    lens.scale = (1.0, 0.75, 1.0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    lens.data.materials.append(lmat)


# =============================================================
# 11. COOLING FAN ON RIGHT SIDE (cooling_fan)
# =============================================================
bpy.ops.mesh.primitive_cylinder_add(radius=0.022, depth=0.022, location=(0.376, 0.0, -0.10), rotation=(0, math.pi / 2, 0))
fan_obj = bpy.context.active_object
fan_obj.name = "cooling_fan"
fan_obj.data.materials.append(mat_fan_blades)

num_blades = 7
for b in range(num_blades):
    angle = b * (2 * math.pi / num_blades)
    y_off = 0.042 * math.cos(angle)
    z_off = 0.042 * math.sin(angle)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.376, y_off, -0.10 + z_off))
    blade = bpy.context.active_object
    blade.scale = (0.0035, 0.038, 0.017)
    blade.rotation_euler = (angle, 0.42, 0.0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    blade.data.materials.append(mat_fan_blades)
    join_to(blade, fan_obj)

bpy.context.scene.cursor.location = (0.376, 0.0, -0.10)
bpy.ops.object.origin_set(type='ORIGIN_CURSOR')


# =============================================================
# SAVE .BLEND & EXPORT DRACO-COMPRESSED GLB
# =============================================================
bpy.ops.object.select_all(action='DESELECT')

blend_save_path = os.path.abspath("blender/electrical_panel.blend")
bpy.ops.wm.save_as_mainfile(filepath=blend_save_path)
print(f"Saved editable blend file -> {blend_save_path}")

bpy.ops.export_scene.gltf(
    filepath=os.path.abspath(output_path),
    export_format='GLB',
    use_selection=False,
    export_apply=True,
    export_yup=True,
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
)
print(f"Exported compressed GLB -> {output_path}")
