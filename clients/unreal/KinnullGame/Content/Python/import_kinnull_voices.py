"""Unreal Editor Python: import prepared Kinnull WAV dialogue as cooked UAssets.
Run in the Unreal Editor Python console, or via UnrealEditor-Cmd PythonScriptPlugin.
The ZIP is not auto-downloaded; extraction remains a deliberate offline owner action.
"""
import unreal
from pathlib import Path

PROJECT = Path(unreal.Paths.project_dir())
DIRECTORY = PROJECT / "Content" / "KinnullVoiceRaw"
DESTINATION = "/Game/Kinnull/Voice"

if not DIRECTORY.exists():
    raise RuntimeError("Extract the Kinnull WAV voice pack into: " + str(DIRECTORY))
wave_files = sorted(DIRECTORY.glob("VO_*.wav"))
if not wave_files:
    raise RuntimeError("No VO_*.wav found at " + str(DIRECTORY))

tools = unreal.AssetToolsHelpers.get_asset_tools()
tasks = []
for wav in wave_files:
    task = unreal.AssetImportTask()
    task.filename = str(wav)
    task.destination_path = DESTINATION
    task.destination_name = wav.stem
    task.automated = True
    task.replace_existing = True
    task.save = True
    tasks.append(task)
tools.import_asset_tasks(tasks)
failures = [t.filename for t in tasks if not t.imported_object_paths]
if failures:
    raise RuntimeError("Voice import failed: " + ", ".join(failures))
print("KINNULL Voice: imported", len(tasks), "offline sound assets at", DESTINATION)
