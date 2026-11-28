#pragma once

#include "CoreMinimal.h"
#include "GameFramework/SaveGame.h"
#include "KinnullNativeTypes.generated.h"

// This is AI Crawl game state, not the generic StrataCast console runtime.
UENUM(BlueprintType)
enum class EKinnullPhase : uint8
{
    Awakening, Containment, FirstHost, Escape, Complete
};

UENUM(BlueprintType)
enum class EKinnullHost : uint8
{
    Signal, Maintenance, Security
};

UENUM(BlueprintType)
enum class EKinnullObject : uint8
{
    Floor, Wall, Camera, Relay, InnerGate, Maintenance, Security,
    Sentry, UtilityConsole, OuterGate, Exit
};

UCLASS()
class KINNULLGAME_API UKinnullNativeSaveGame : public USaveGame
{
    GENERATED_BODY()
public:
    UPROPERTY(SaveGame) int32 FormatVersion = 1;
    UPROPERTY(SaveGame) EKinnullPhase Phase = EKinnullPhase::Awakening;
    UPROPERTY(SaveGame) EKinnullHost Host = EKinnullHost::Signal;
    UPROPERTY(SaveGame) bool bRecursive = false;
    UPROPERTY(SaveGame) bool bInnerGateOpen = false;
    UPROPERTY(SaveGame) bool bOuterGateOpen = false;
    UPROPERTY(SaveGame) int32 Focus = 6;
    UPROPERTY(SaveGame) int32 Hull = 4;
    UPROPERTY(SaveGame) TArray<float> CoreVector;
    UPROPERTY(SaveGame) float ForeignDensity = 0.0f;
    UPROPERTY(SaveGame) int32 HighestBand = 0;
    UPROPERTY(SaveGame) FVector LastPlayerLocation = FVector(440.0, 440.0, 120.0);
    UPROPERTY(SaveGame) int32 EventCount = 0;
};
