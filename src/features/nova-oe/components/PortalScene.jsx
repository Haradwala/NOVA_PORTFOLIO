import NOVAMatterSphere from './NOVAMatterSphere';

export default function PortalScene({
  isHovered,
  setIsHovered,
  activeWorld,
  pulseTrigger,
  onSelectNode,
}) {
  return (
    <NOVAMatterSphere
      isHovered={isHovered}
      setIsHovered={setIsHovered}
      activeWorld={activeWorld}
      pulseTrigger={pulseTrigger}
      onSelectNode={onSelectNode}
    />
  );
}
