import { useState } from "react";
import { AlertDialog, Box, Button, Dialog, Flex, Grid, Heading, Text, TextField } from "@radix-ui/themes";
import { PlantCard } from "../components/dashboard/PlantCard";
import { mockPlants } from "../data/mockPlants";
import type { Plant } from "../types/plant";

export function DashboardPage() {
  const [plants, setPlants] = useState<Plant[]>(mockPlants);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [deletingPlant, setDeletingPlant] = useState<Plant | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftSpecies, setDraftSpecies] = useState("");

  function handleEdit(plant: Plant) {
    setEditingPlant(plant);
    setDraftName(plant.name);
    setDraftSpecies(plant.species);
  }

  function handleSaveEdit() {
    if (!editingPlant) return;
    setPlants((current) =>
      current.map((plant) =>
        plant.id === editingPlant.id ? { ...plant, name: draftName, species: draftSpecies } : plant,
      ),
    );
    setEditingPlant(null);
  }

  function handleConfirmDelete() {
    if (!deletingPlant) return;
    setPlants((current) => current.filter((plant) => plant.id !== deletingPlant.id));
    setDeletingPlant(null);
  }

  return (
    <Box p="6">
      <Heading size="6" mb="4">
        My Plants
      </Heading>

      <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="6" maxWidth="90%" mx="auto">
        {plants.map((plant) => (
          <PlantCard
            key={plant.id}
            plant={plant}
            onEdit={() => handleEdit(plant)}
            onDelete={() => setDeletingPlant(plant)}
          />
        ))}
      </Grid>

      <Dialog.Root open={editingPlant !== null} onOpenChange={(open) => !open && setEditingPlant(null)}>
        <Dialog.Content maxWidth="400px">
          <Dialog.Title>Edit plant</Dialog.Title>

          <Flex direction="column" gap="3">
            <label>
              <Text as="div" size="2" mb="1" weight="medium">
                Name
              </Text>
              <TextField.Root value={draftName} onChange={(e) => setDraftName(e.target.value)} />
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="medium">
                Species
              </Text>
              <TextField.Root value={draftSpecies} onChange={(e) => setDraftSpecies(e.target.value)} />
            </label>
          </Flex>

          <Flex gap="3" justify="end" mt="4">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button onClick={handleSaveEdit}>Save</Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <AlertDialog.Root open={deletingPlant !== null} onOpenChange={(open) => !open && setDeletingPlant(null)}>
        <AlertDialog.Content maxWidth="400px">
          <AlertDialog.Title>Delete {deletingPlant?.name}?</AlertDialog.Title>
          <AlertDialog.Description size="2">
            This can&apos;t be undone.
          </AlertDialog.Description>

          <Flex gap="3" justify="end" mt="4">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button color="red" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Box>
  );
}
