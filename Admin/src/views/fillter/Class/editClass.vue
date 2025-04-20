<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Class } from '../../../models/Class';

const route = useRoute();
const router = useRouter();
const formData = ref<Class>({
  Class_ID: 0,
  Name: '',
  Division_ID: 0
});
const divisions = ref<{ Division_ID: number; Name: string }[]>([]);

const fetchClass = async (id: number) => {
  try {
    // TODO: Implement API call to fetch class
    // const response = await classService.getById(id);
    // formData.value = response.data;
  } catch (error) {
    console.error('Error fetching class:', error);
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

const handleSubmit = async () => {
  try {
    // TODO: Implement API call to update class
    // await classService.update(formData.value);
    router.push({ name: 'listClass' });
  } catch (error) {
    console.error('Error updating class:', error);
  }
};

onMounted(() => {
  const id = Number(route.params.id);
  if (id) {
    fetchClass(id);
  }
  fetchDivisions();
});
</script>

<template>
  <div class="class-edit">
    <h1>Edit Class</h1>
    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="name">Name:</label>
          <input 
            type="text" 
            id="name" 
            v-model="formData.Name" 
            required
          />
        </div>
        <div class="form-group">
          <label for="division">Division:</label>
          <select 
            id="division" 
            v-model="formData.Division_ID" 
            required
          >
            <option value="">Select Division</option>
            <option 
              v-for="division in divisions" 
              :key="division.Division_ID" 
              :value="division.Division_ID"
            >
              {{ division.Name }}
            </option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">Update Class</button>
      </form>
    </div>
  </div>
</template>



<style scoped>
.class-edit {
  padding: 20px;
}

.form-container {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}
</style> 