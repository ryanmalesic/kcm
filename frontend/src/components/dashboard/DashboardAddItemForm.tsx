import { useRef, useState } from "react";

interface DashboardAddItemFormProps {
  disabled: boolean;
  onSubmit: (itemId: string) => Promise<void>;
}

const DashboardAddItemForm: React.FC<DashboardAddItemFormProps> = (props) => {
  const { disabled, onSubmit } = props;

  const itemIdRef = useRef<HTMLInputElement | null>(null);
  const [itemId, setItemId] = useState("");

  return (
    <form
      className="space-x-4"
      onSubmit={(event) => {
        event.preventDefault();

        if (disabled) {
          return;
        }

        onSubmit(itemId);
        setItemId("");

        itemIdRef.current?.click();
        itemIdRef.current?.focus();
      }}
    >
      <input
        className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded outline-none focus:ring-1 focus:ring-karns-500 disabled:focus:ring-0"
        disabled={disabled}
        id="id"
        name="id"
        placeholder="SVIC or UPC"
        ref={itemIdRef}
        required
        type="text"
        value={itemId}
        onChange={(event) => setItemId(event.target.value)}
      />

      <button
        className="inline-flex justify-center px-4 py-2 text-sm font-medium border border-transparent rounded bg-karns-100 hover:bg-karns-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-karns focus-visible:ring-offset-2"
        disabled={disabled}
        type="submit"
      >
        Add Item
      </button>
    </form>
  );
};

export default DashboardAddItemForm;
