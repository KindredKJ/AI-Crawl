using UnrealBuildTool;

public class KinnullGame : ModuleRules
{
    public KinnullGame(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;
        PublicDependencyModuleNames.AddRange(new string[] {
            "Core", "CoreUObject", "Engine", "InputCore"
        });
        PrivateDependencyModuleNames.AddRange(new string[] {
            "Json", "JsonUtilities"
        });
    }
}
