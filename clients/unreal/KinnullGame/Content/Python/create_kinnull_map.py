"""Create the authored-entry native Awakening UMAP in Unreal Editor; UE5.8 Python Script Plugin required.
Run once before cooking. Level geometry and gameplay actors are generated at runtime
by AKinnullNativeGameMode in a separate AI Crawl game module.
"""
import unreal

level="/Game/Kinnull/Maps/Awakening"
if not unreal.EditorAssetLibrary.does_asset_exist(level):
    unreal.EditorLevelLibrary.new_level(level)
    unreal.EditorAssetLibrary.save_asset(level)
if not unreal.EditorAssetLibrary.does_asset_exist(level):
    raise RuntimeError("Unable to save native Awakening UMAP: " + level)
print("KINNULL level bootstrap ready:",level)
