<template>
  <div class="species-edit">
    <h1>{{ isEdit ? 'Edit Species' : 'Create Species' }}</h1>
    <form @submit.prevent="saveSpecies" class="form">
      <div class="form-group">
        <label for="name">Name:</label>
        <input
          type="text"
          id="name"
          v-model="species.Name"
          required
          class="form-control"
        />
      </div>
      <div class="form-group">
        <label for="genus">Genus:</label>
        <select
          id="genus"
          v-model="species.Genus_ID"
          required
          class="form-control"
        >
          <option value="">Select Genus</option>
          <option
            v-for="genus in genera"
            :key="genus.Genus_ID"
            :value="genus.Genus_ID"
          >
            {{ genus.Name }}
          </option>
        </select>
      </div>
      <div class="form-actions">
        <button type="button" @click="goBack" class="btn btn-cancel">Cancel</button>
        <button type="submit" class="btn btn-save">
          {{ isEdit ? 'Update' : 'Create' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Species } from '../../../models/Species';

const route = useRoute();
const router = useRouter();
const species = ref<Species>({
  Species_ID: 0,
  Name: '',
  Genus_ID: 0
});
const genera = ref<{ Genus_ID: number; Name: string }[]>([]);

const isEdit = computed(() => route.params.id !== undefined);

const fetchSpecies = async (id: number) => {
  try {
    // TODO: Implement API call to fetch species by ID
    // species.value = await speciesService.getById(id);
  } catch (error) {
    console.error('Error fetching species:', error);
  }
};

const fetchGenera = async () => {
  try {
    // TODO: Implement API call to fetch genera
    // genera.value = await genusService.getAll();
  } catch (error) {
    console.error('Error fetching genera:', error);
  }
};

const saveSpecies = async () => {
  try {
    if (isEdit.value) {
      // TODO: Implement API call to update species
      // await speciesService.update(species.value);
    } else {
      // TODO: Implement API call to create species
      // await speciesService.create(species.value);
    }
    goBack();
  } catch (error) {
    console.error('Error saving species:', error);
  }
};

const goBack = () => {
  router.push({ name: 'listSpecies' });
};

onMounted(() => {
  fetchGenera();
  if (isEdit.value) {
    const id = parseInt(route.params.id as string);
    if (!isNaN(id)) {
      fetchSpecies(id);
    }
  }
});
</script>

<style scoped>
.species-edit {
  padding: 20px;
}

.form {
  max-width: 500px;
  margin-top: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-cancel {
  background-color: #f44336;
  color: white;
}

.btn-save {
  background-color: #4CAF50;
  color: white;
}
</style> 