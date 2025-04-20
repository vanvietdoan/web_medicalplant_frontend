<template>
  <div class="genus-list">
    <h1>Genus List</h1>
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Family</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="genus in genera" :key="genus.Genus_ID">
            <td>{{ genus.Genus_ID }}</td>
            <td>{{ genus.Name }}</td>
            <td>{{ getFamilyName(genus.Family_ID) }}</td>
            <td>
              <button @click="editGenus(genus)" class="btn btn-edit">Edit</button>
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
import type { Genus } from '../../../models/Genus';

const router = useRouter();
const genera = ref<Genus[]>([]);
const families = ref<{ Family_ID: number; Name: string }[]>([]);

const fetchGenera = async () => {
  try {
    // TODO: Implement API call to fetch genera
    // genera.value = await genusService.getAll();
  } catch (error) {
    console.error('Error fetching genera:', error);
  }
};

const fetchFamilies = async () => {
  try {
    // TODO: Implement API call to fetch families
    // families.value = await familyService.getAll();
  } catch (error) {
    console.error('Error fetching families:', error);
  }
};

const getFamilyName = (familyId: number) => {
  const family = families.value.find(f => f.Family_ID === familyId);
  return family ? family.Name : '';
};

const editGenus = (genus: Genus) => {
  router.push({ name: 'editGenus', params: { id: genus.Genus_ID } });
};

onMounted(() => {
  fetchGenera();
  fetchFamilies();
});
</script>

<style scoped>
.genus-list {
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