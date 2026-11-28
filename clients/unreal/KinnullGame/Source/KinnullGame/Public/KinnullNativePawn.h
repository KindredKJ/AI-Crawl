#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Pawn.h"
#include "KinnullNativePawn.generated.h"

class UCapsuleComponent;
class UStaticMeshComponent;
class USpringArmComponent;
class UCameraComponent;
class UFloatingPawnMovement;
class UKinnullProceduralRig;

UCLASS()
class KINNULLGAME_API AKinnullNativePawn : public APawn
{
    GENERATED_BODY()
public:
    AKinnullNativePawn();
    virtual void SetupPlayerInputComponent(UInputComponent* PlayerInputComponent) override;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly) TObjectPtr<UCapsuleComponent> Capsule;
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly) TObjectPtr<UStaticMeshComponent> Body;
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly) TObjectPtr<USpringArmComponent> Boom;
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly) TObjectPtr<UCameraComponent> Camera;
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly) TObjectPtr<UFloatingPawnMovement> Movement;
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly) TObjectPtr<UKinnullProceduralRig> AnimatedRig;

    void PlayCinematicBeat(int32 Beat);
    void EndCinematicBeat();
    void TriggerCombatAttack();
    void TriggerCombatHit();
    void SetRigRoleForHost(bool bHasBody, bool bSecurity);

    void DisplayHost(bool bHasBody, bool bSecurity);
private:
    void Forward(float Axis);
    void Right(float Axis);
    void Interact();
    void Predict();
    void ToggleDepth();
    void NewRun();
    void Fire();
    void Dodge();
    float CinematicTime = 0.f;
    int32 CinematicBeat = 0;
    virtual void Tick(float DeltaSeconds) override;
};
