"use client";
import { Modal, ModalContent, ModalFooter } from "@/app/components/ui/Modal";
import { Button } from "@/app/components/ui/Button";
import { Field, TextInput } from "@/app/creator/endpoints/new/form/Field";

type Props = {
  open: boolean;
  onClose: () => void;
  pending: boolean;
  newGroupName: string;
  setNewGroupName: (v: string) => void;
  selectedPlanName?: string;
  errorText?: string[];
  onCreate: () => void;
  canCreate: boolean;
};

export default function NewGroupModal({
  open, onClose, pending,
  newGroupName, setNewGroupName,
  selectedPlanName, errorText,
  onCreate, canCreate,
}: Props) {
  return (
    <Modal isOpen={open} onClose={onClose} title="Create New Group">
      <ModalContent>
        <div className="space-y-4">
          <Field id="new-group-name" label="Group Name" error={errorText}>
            <TextInput
              id="new-group-name"
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="e.g., Light APIs"
              disabled={pending}
            />
          </Field>
          <p className="text-sm text-gray-600">
            The group will be created in the selected plan:{" "}
            <strong>{selectedPlanName ?? "(not selected)"}</strong>
          </p>
        </div>
      </ModalContent>
      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={pending}>Cancel</Button>
        <Button onClick={onCreate} disabled={!canCreate || pending}>Create Group</Button>
      </ModalFooter>
    </Modal>
  );
}
