#include "KinnullPropActor.h"
#include "Components/StaticMeshComponent.h"
#include "Components/TextRenderComponent.h"
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
    Marker = CreateDefaultSubobject<UTextRenderComponent>(TEXT("WorldMarker"));
    Marker->SetupAttachment(Mesh);
    Marker->SetRelativeLocation(FVector(0.f, 0.f, 110.f));
    Marker->SetHorizontalAlignment(EHTA_Center);
    Marker->SetWorldSize(65.f);
    Marker->SetTextRenderColor(FColor::Cyan);
}

void AKinnullPropActor::Initialize(
    EKinnullObject NewKind, const FVector& Position,
    const FVector& Scale, bool bBlocking)
{
    Kind = NewKind;
    const TCHAR* Label = TEXT("");
    switch (Kind)
    {
    case EKinnullObject::Camera: Label = TEXT("CAMERA [E]"); break;
    case EKinnullObject::Relay: Label = TEXT("RELAY [E]"); break;
    case EKinnullObject::Maintenance: Label = TEXT("MAINTENANCE [E]"); break;
    case EKinnullObject::Security: Label = TEXT("SECURITY [E]"); break;
    case EKinnullObject::Sentry: Label = TEXT("SENTRY"); break;
    case EKinnullObject::UtilityConsole: Label = TEXT("UTILITY [E]"); break;
    case EKinnullObject::Exit: Label = TEXT("EXIT [E]"); break;
    case EKinnullObject::InnerGate: Label = TEXT("INNER GATE"); break;
    case EKinnullObject::OuterGate: Label = TEXT("OUTER GATE"); break;
    default: break;
    }
    Marker->SetText(FText::FromString(Label));
    Marker->SetVisibility(Kind != EKinnullObject::Floor && Kind != EKinnullObject::Wall);
    if (Kind == EKinnullObject::Sentry) Marker->SetTextRenderColor(FColor::Red);
    if (Kind == EKinnullObject::Security) Marker->SetTextRenderColor(FColor::Magenta);
    SetActorLocation(Position);
    SetActorScale3D(Scale);
    Mesh->SetCollisionEnabled(bBlocking ?
        ECollisionEnabled::QueryAndPhysics : ECollisionEnabled::NoCollision);
    Mesh->SetCollisionResponseToAllChannels(bBlocking ? ECR_Block : ECR_Ignore);
}

void AKinnullPropActor::OpenGate()
{
    Mesh->SetVisibility(false);
    Marker->SetVisibility(false);
    Mesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    Mesh->SetCollisionResponseToAllChannels(ECR_Ignore);
}
