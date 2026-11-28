#pragma once

#include "CoreMinimal.h"
#include "Components/SceneComponent.h"
#include "KinnullProceduralRig.generated.h"

class UStaticMeshComponent;

/**
 * Offline game-generated articulated proxy rigs. These are real 3D animated
 * scene-component hierarchies; not skinned meshes, Control Rig assets, or final
 * production character art. Character art can later replace these components.
 */
UENUM(BlueprintType)
enum class EKinnullRigRole : uint8
{
    PredictiveCore,
    MaintenanceCrawler,
    SecuritySentinel,
    CorporateHandler,
    DroneSoldier,
    NaniteDragon
};

UCLASS(ClassGroup=(Kinnull), meta=(BlueprintSpawnableComponent))
class KINNULLGAME_API UKinnullProceduralRig : public USceneComponent
{
    GENERATED_BODY()
public:
    UKinnullProceduralRig();

    UFUNCTION(BlueprintCallable, Category="Kinnull|Animation")
    void SetRigRole(EKinnullRigRole NewRole);

    UFUNCTION(BlueprintCallable, Category="Kinnull|Animation")
    void TriggerPossession();

    UFUNCTION(BlueprintCallable, Category="Kinnull|Animation")
    void TriggerAttack();

    UFUNCTION(BlueprintCallable, Category="Kinnull|Animation")
    void TriggerHit();

    virtual void BeginPlay() override;
    virtual void TickComponent(float DeltaTime, ELevelTick TickType,
                               FActorComponentTickFunction* ThisTickFunction) override;

private:
    UPROPERTY(Transient) TArray<TObjectPtr<UStaticMeshComponent>> Parts;
    UPROPERTY(Transient) TObjectPtr<USceneComponent> LeftJoint;
    UPROPERTY(Transient) TObjectPtr<USceneComponent> RightJoint;
    UPROPERTY(Transient) TObjectPtr<USceneComponent> HeadJoint;
    UPROPERTY(Transient) TObjectPtr<USceneComponent> TailJoint;

    EKinnullRigRole Role = EKinnullRigRole::PredictiveCore;
    float RunningTime = 0.f;
    float PossessionTime = 0.f;
    float AttackTime = 0.f;
    float HitTime = 0.f;

    USceneComponent* Joint(const FName& Name, const FVector& Location);
    void AddPart(const TCHAR* Name, const TCHAR* Asset,
                 USceneComponent* Parent, FVector Location, FVector Scale);
    void BuildRig();
};
