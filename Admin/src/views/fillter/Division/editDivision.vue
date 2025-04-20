<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Division } from '../../../models/division';
import divisionService from '../../../services/fillter/division.service';

const route = useRoute();
const router = useRouter();
const formData = ref<{ name: string }>({
  name: ''
});

const fetchDivision = async (id: number) => {
  try {
    const division = await divisionService.getDivisionById(id);
    formData.value.name = division.name;
  } catch (error) {
    console.error('Error fetching division:', error);
  }
};

const handleSubmit = async () => {
  try {
    const id = Number(route.params.id);
    await divisionService.updateDivision(id, { name: formData.value.name });
    router.push({ name: 'listDivision' });
  } catch (error) {
    console.error('Error updating division:', error);
  }
};

onMounted(() => {
  const id = Number(route.params.id);
  if (id) {
    fetchDivision(id);
  }
});
</script>

<template>
  <div class="division-edit">
    <h1>Cập nhật ngành</h1>
    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="name">Hãy nhập tên ngành muốn nhập:</label>
          <input 
            type="text" 
            id="name" 
            v-model="formData.name" 
            required
          />
        </div>
        <button type="submit" class="btn btn-primary">Cập nhật</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.division-edit {
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

.form-group input {
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

.btn:hover {
  opacity: 0.9;
}
</style> 