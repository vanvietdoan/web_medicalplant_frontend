<template>
  <div class="user-list">
    <div class="header">
      <h2>Quản lý tài khoản</h2>
      <button @click="showAddModal = true" class="btn-add">
        <i class="fas fa-plus"></i> Thêm tài khoản
      </button>
    </div>

    <div class="search-bar">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Tìm kiếm tài khoản..."
        @input="handleSearch"
      >
    </div>

    <table class="user-table">
      <thead>
        <tr>
          <th>Họ tên</th>
          <th>Email</th>
          <th>Số điện thoại</th>
          <th>Vai trò</th>
          <th>Trạng thái</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in filteredUsers" :key="user.id">
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.phone }}</td>
          <td>
            <span :class="['role-tag', user.role]">
              {{ getRoleText(user.role) }}
            </span>
          </td>
          <td>
            <span :class="['status', user.active ? 'active' : 'inactive']">
              {{ user.active ? 'Hoạt động' : 'Khóa' }}
            </span>
          </td>
          <td>
            <div class="action-buttons">
              <button @click="editUser(user)" class="btn-edit">
                <i class="fas fa-edit"></i>
              </button>
              <button 
                @click="toggleUserStatus(user.id)" 
                :class="['btn-toggle', user.active ? 'btn-deactivate' : 'btn-activate']"
              >
                <i :class="['fas', user.active ? 'fa-lock' : 'fa-unlock']"></i>
              </button>
              <button @click="deleteUser(user.id)" class="btn-delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || showEditModal" class="modal">
      <div class="modal-content">
        <h3>{{ showEditModal ? 'Sửa tài khoản' : 'Thêm tài khoản mới' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Họ tên</label>
            <input v-model="userForm.name" type="text" required>
          </div>

          <div class="form-group">
            <label>Email</label>
            <input v-model="userForm.email" type="email" required>
          </div>

          <div class="form-group">
            <label>Số điện thoại</label>
            <input v-model="userForm.phone" type="tel" required>
          </div>

          <div class="form-group">
            <label>Mật khẩu</label>
            <input v-model="userForm.password" type="password" :required="!showEditModal">
          </div>

          <div class="form-group">
            <label>Vai trò</label>
            <select v-model="userForm.role" required>
              <option value="admin">Quản trị viên</option>
              <option value="moderator">Người kiểm duyệt</option>
              <option value="user">Người dùng</option>
            </select>
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" v-model="userForm.active">
              Kích hoạt tài khoản
            </label>
          </div>

          <div class="modal-actions">
            <button type="submit" class="btn-save">Lưu</button>
            <button type="button" @click="closeModal" class="btn-cancel">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'

interface User {
  id: number
  name: string
  email: string
  phone: string
  role: 'admin' | 'moderator' | 'user'
  active: boolean
}

const users = ref<User[]>([
  {
    id: 1,
    name: 'Admin',
    email: 'admin@example.com',
    phone: '0123456789',
    role: 'admin',
    active: true
  }
])

const showAddModal = ref(false)
const showEditModal = ref(false)
const searchQuery = ref('')

const userForm = reactive({
  id: 0,
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'user' as const,
  active: true
})

const filteredUsers = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user => 
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query) ||
    user.phone.includes(query)
  )
})

const getRoleText = (role: string) => {
  switch (role) {
    case 'admin': return 'Quản trị viên'
    case 'moderator': return 'Người kiểm duyệt'
    case 'user': return 'Người dùng'
    default: return ''
  }
}

const handleSearch = () => {
  // Implement search logic if needed
}

const editUser = (user: User) => {
  Object.assign(userForm, { ...user, password: '' })
  showEditModal.value = true
}

const toggleUserStatus = async (id: number) => {
  const user = users.value.find(u => u.id === id)
  if (user) {
    user.active = !user.active
  }
}

const deleteUser = async (id: number) => {
  if (confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
    // Implement delete logic
    users.value = users.value.filter(user => user.id !== id)
  }
}

const handleSubmit = async () => {
  if (showEditModal.value) {
    // Implement update logic
    const index = users.value.findIndex(u => u.id === userForm.id)
    if (index !== -1) {
      users.value[index] = { ...userForm }
    }
  } else {
    // Implement create logic
    const newUser = {
      ...userForm,
      id: users.value.length + 1
    }
    users.value.push(newUser)
  }
  closeModal()
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  Object.assign(userForm, {
    id: 0,
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    active: true
  })
}
</script>

<style scoped>
.user-list {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  margin-bottom: 20px;
}

.search-bar input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.user-table th,
.user-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.role-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.9em;
}

.role-tag.admin {
  background: #e3f2fd;
  color: #1976d2;
}

.role-tag.moderator {
  background: #fff3e0;
  color: #ff9800;
}

.role-tag.user {
  background: #f5f5f5;
  color: #616161;
}

.status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

.status.active {
  background: #e8f5e9;
  color: #4CAF50;
}

.status.inactive {
  background: #ffebee;
  color: #f44336;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.btn-add {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-edit,
.btn-toggle,
.btn-delete {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
}

.btn-edit {
  background: #2196F3;
}

.btn-toggle.btn-activate {
  background: #4CAF50;
}

.btn-toggle.btn-deactivate {
  background: #ff9800;
}

.btn-delete {
  background: #f44336;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="tel"],
.form-group input[type="password"],
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-save {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-cancel {
  background: #9e9e9e;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
</style> 