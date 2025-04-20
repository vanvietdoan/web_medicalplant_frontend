<template>
  <div class="class-list">
    <h1>Class List</h1>
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Division</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="classItem in classes" :key="classItem.Class_ID">
            <td>{{ classItem.Class_ID }}</td>
            <td>{{ classItem.Name }}</td>
            <td>{{ getDivisionName(classItem.Division_ID) }}</td>
            <td>
              <button @click="editClass(classItem)" class="btn btn-edit">Edit</button>
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
import type { Class } from '../../../models/Class';

const router = useRouter();
const classes = ref<Class[]>([]);
const divisions = ref<{ Division_ID: number; Name: string }[]>([]);

const fetchClasses = async () => {
  try {
    // TODO: Implement API call to fetch classes
    // classes.value = await classService.getAll();
  } catch (error) {
    console.error('Error fetching classes:', error);
  }
};

const fetchDivisions = async () => {
  try {
    // TODO: Implement API call to fetch divisions
    // divisions.value = await divisionService.getAll();
  } catch (error) {
    console.error('Error fetching divisions:', error);
  }
};

const getDivisionName = (divisionId: number) => {
  const division = divisions.value.find(d => d.Division_ID === divisionId);
  return division ? division.Name : '';
};

const editClass = (classItem: Class) => {
  router.push({ name: 'editClass', params: { id: classItem.Class_ID } });
};

onMounted(() => {
  fetchClasses();
  fetchDivisions();
});
</script>

<style scoped>
.class-list {
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