#include "KinnullPropActor.h"
#include "Components/StaticMeshComponent.h"
#include "UObject/ConstructorHelpers.h"

AKinnullPropActor::AKinnullPropActor()
{
    PrimaryActorTick.bCanEverTick = false;
    Mesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("NativeMesh"));
    SetRootComponent(Mesh);
    static ConstructorHelpers::FObjectFinder<UStaticMesh> Cube(
        TEXT("/Engine/BasicShapes/Cube.Cube"));
    if (Cube.Succeeded()) Mesh->SetStaticMesh(Cube.Object);
    Mesh->SetMobility(EComponentMobility::Movable);
}

void AKinnullPropActor::Initialize(
    EKinnullObject NewKind, const FVector& Position,
    const FVector& Scale, bool bBlocking)
{
    Kind = NewKind;
    SetActorLocation(Position);
    SetActorScale3D(Scale);
    Mesh->SetCollisionEnabled(bBlocking ?
        ECollisionEnabled::QueryAndPhysics : ECollisionEnabled::NoCollision);
    Mesh->SetCollisionResponseToAllChannels(bBlocking ? ECR_Block : ECR_Ignore);
}

void AKinnullPropActor::OpenGate()
{
    Mesh->SetVisibility(false);
    Mesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    Mesh->SetCollisionResponseToAllChannels(ECR_Ignore);
}
