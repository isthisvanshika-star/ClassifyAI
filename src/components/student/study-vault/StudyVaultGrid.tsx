import StudyVaultCard from "./StudyVaultCard";

export default function StudyVaultGrid({
  filteredResources,
  getIcon,
  handleResourceClick,
}: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredResources.map((res: any) => (
        <StudyVaultCard
          key={res.id}
          res={res}
          getIcon={getIcon}
          onClick={handleResourceClick}
        />
      ))}
    </div>
  );
}