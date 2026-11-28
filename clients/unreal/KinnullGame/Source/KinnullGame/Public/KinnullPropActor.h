#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "KinnullNativeTypes.h"
#include "KinnullPropActor.generated.h"

class UStaticMeshComponent;
class UTextRenderComponent;

UCLASS()
class KINNULLGAME_API AKinnullPropActor : public AActor
{
    GENERATED_BODY()
public:
    AKinnullPropActor();

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly) TObjectPtr<UStaticMeshComponent> Mesh;
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly) EKinnullObject Kind = EKinnullObject::Floor;
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly) TObjectPtr<UTextRenderComponent> Marker;

    void Initialize(EKinnullObject NewKind, const FVector& Position,
                    const FVector& Scale, bool bBlocking);
    void OpenGate();
};
