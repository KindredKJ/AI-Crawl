#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "KinnullNativeTypes.h"
#include "KinnullNativeGameMode.generated.h"

class AKinnullNativePawn;
class AKinnullPropActor;
class ADirectionalLight;
class ASkyLight;

UCLASS()
class KINNULLGAME_API AKinnullNativeGameMode : public AGameModeBase
{
    GENERATED_BODY()
public:
    AKinnullNativeGameMode();
    virtual void BeginPlay() override;
    virtual void Tick(float DeltaSeconds) override;

    /** Press E or gamepad confirm near fictional in-game equipment. */
    void Interact(AKinnullNativePawn* Player);
    void Predict();
    void ToggleDepth();
    /** Explicit new run is permitted only after this mission is completed. */
    void StartNewRun();

private:
    UPROPERTY(Transient) TObjectPtr<UKinnullNativeSaveGame> State;
    UPROPERTY(Transient) TArray<TObjectPtr<AKinnullPropActor>> Props;
    UPROPERTY(Transient) TObjectPtr<AKinnullPropActor> InnerGate;
    UPROPERTY(Transient) TObjectPtr<AKinnullPropActor> OuterGate;

    bool bRestoredPosition = false;
    bool bPredictionArmed = false;
    bool bRequestedRecursive = false;
    float SentryTimer = 0.0f;
    float SaveTimer = 0.0f;
    float HudTimer = 0.0f;
    int32 EventCounter = 0;

    void ResetToInitialState();
    void LoadSavedState();
    void SaveProgress();
    void GenerateFacility();
    AKinnullPropActor* Put(EKinnullObject Type, int32 X, int32 Y,
                          float Height, FVector Scale, bool bBlocking);
    static FVector Grid(int32 X, int32 Y, float Z = 120.f);
    void ReactToSentries(AKinnullNativePawn* Player);
    void Possess(AKinnullNativePawn* Player, EKinnullHost Host);
    void Erode(EKinnullHost Host, bool bRecursive, float Duration,
               float Conflict = 1.0f, float Resistance = 1.0f);
    float Integrity() const;
    FString CurrentObjective() const;
    void Notice(const FString& Line, FColor Color = FColor::Cyan) const;
};
