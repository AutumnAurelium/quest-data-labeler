export default function MetadataContainer(props: {
  metadata: Record<string, string>;
}) {
  return (
    <div>
      {Object.entries(props.metadata).map(([key, value]) => (
        <div key={key}>
          {key}: {value}
        </div>
      ))}
    </div>
  );
}
