<template>
  <div class="species-list">
    <h1>Species List</h1>
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Genus</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="species in speciesList" :key="species.Species_ID">
            <td>{{ species.Species_ID }}</td>
            <td>{{ species.Name }}</td>
            <td>{{ getGenusName(species.Genus_ID) }}</td>
            <td>
              <button @click="editSpecies(species)" class="btn btn-edit">Edit</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { Species } from '../../../models/Species';

const router = useRouter();
const speciesList = ref<Species[]>([]);
const genera = ref<{ Genus_ID: number; Name: string }[]>([]);

const fetchSpecies = async () => {
  try {
    // TODO: Implement API call to fetch species
    // speciesList.value = await speciesService.getAll();
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

const getGenusName = (genusId: number) => {
  const genus = genera.value.find(g => g.Genus_ID === genusId);
  return genus ? genus.Name : '';
};

const editSpecies = (species: Species) => {
  router.push({ name: 'editSpecies', params: { id: species.Species_ID } });
};

onMounted(() => {
  fetchSpecies();
  fetchGenera();
});
</script>

<style scoped>
.species-list {
  padding: 20px;
}

.table-container {
  margin-top: 20px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 12px;
  border: 1px solid #ddd;
  text-align: left;
}

.table th {
  background-color: #f5f5f5;
}

.btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
}

.btn-edit {
  background-color: #2196F3;
  color: white;
}
</style> 