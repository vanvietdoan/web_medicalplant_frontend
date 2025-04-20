<template>
  <div class="order-list">
    <h1>Order List</h1>
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Class</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.Order_ID">
            <td>{{ order.Order_ID }}</td>
            <td>{{ order.Name }}</td>
            <td>{{ getClassName(order.Class_ID) }}</td>
            <td>
              <button @click="editOrder(order)" class="btn btn-edit">Edit</button>
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
import type { Order } from '../../../models/Order';

const router = useRouter();
const orders = ref<Order[]>([]);
const classes = ref<{ Class_ID: number; Name: string }[]>([]);

const fetchOrders = async () => {
  try {
    // TODO: Implement API call to fetch orders
    // orders.value = await orderService.getAll();
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
};

const fetchClasses = async () => {
  try {
    // TODO: Implement API call to fetch classes
    // classes.value = await classService.getAll();
  } catch (error) {
    console.error('Error fetching classes:', error);
  }
};

const getClassName = (classId: number) => {
  const classItem = classes.value.find(c => c.Class_ID === classId);
  return classItem ? classItem.Name : '';
};

const editOrder = (order: Order) => {
  router.push({ name: 'editOrder', params: { id: order.Order_ID } });
};

onMounted(() => {
  fetchOrders();
  fetchClasses();
});
</script>

<style scoped>
.order-list {
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