"""Import the six original animated glTF greybox characters provided with this project.
This is an import attempt and validation gate, not a claim of successful UE
skeletal retargeting or a replacement for professional rig/animation review.

Extract the Kinnull_Character_Rigs_Animation_Blockouts.zip contents to
Content/KinnullRigRaw/ before executing inside Unreal Editor.
"""
import unreal
from pathlib import Path

PROJECT = Path(unreal.Paths.project_dir())
SOURCE = PROJECT / "Content" / "KinnullRigRaw"
DESTINATION = "/Game/Kinnull/Characters"
expected = [
    "Kinnull_Original_Core",
    "Kinnull_Maintenance_Crawler",
    "Kinnull_Security_Sentinel",
    "Corporate_Handler",
    "Drone_Soldier",
    "Nanite_Dragon",
]
if not SOURCE.exists():
    raise RuntimeError("Unreal Kinnull glTF folder missing: " + str(SOURCE))
tasks = []
for basename in expected:
    f = SOURCE / (basename + ".gltf")
    if not f.exists():
        raise RuntimeError("Missing Kinnull rig source: " + str(f))
    task = unreal.AssetImportTask()
    task.filename = str(f)
    task.destination_path = DESTINATION
    task.automated = True
    task.replace_existing = True
    task.save = True
    tasks.append(task)
unreal.AssetToolsHelpers.get_asset_tools().import_asset_tasks(tasks)
errors = [t.filename for t in tasks if not t.imported_object_paths]
if errors:
    raise RuntimeError("UE Interchange skeletal glTF import did not complete for: " +
                       ", ".join(errors) +
                       ". If UE5.8 lacks skinned glTF support, convert to FBX in Blender.")
for task in tasks:
    print("KINNULL imported", task.filename, "=>", task.imported_object_paths)
print("KINNULL import completed. Inspect SkeletalMeshes, skeleton joints, imported animation curves and retargeting manually.")
