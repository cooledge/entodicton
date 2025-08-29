import React, { useState, useEffect } from 'react';

const Users = ({ km }) => {
  // State for the list of users and the current form input
  const [users, setUsers] = useState([
    { id: 'employee#1', name: 'greg' },
    { id: 'employee#2', name: 'bob' },
  ]);

  useEffect(() => {
    if (km) {
      for (const user of users) {
        km.kms.reminders.api.addRemindable(user.id, user.name);
      }
    }
  }, [km]); // Empty dependency array means this runs once on mount

  const [nameInput, setNameInput] = useState('');
  const [editId, setEditId] = useState(null);

  // Handle form submission for creating or updating a user
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return; // Prevent empty names
    if (editId) {
      // Update existing user
      setUsers(
        users.map((user) =>
          user.id === editId ? { ...user, name: nameInput } : user
        )
      );
      setEditId(null); // Exit edit mode
    } else {
      // Create new user
      const toIdNumber = (idString) => {
        return Number(idString.split('#')[1])
      }
      const newUser = {
        id: `employee#${users.length ? Math.max(...users.map((u) => toIdNumber(u.id))) + 1 : 1}`,
        name: nameInput,
      };
      debugger
      setUsers([...users, newUser]);
      km.kms.reminders.api.addRemindable(newUser.id, newUser.name)
    }
    setNameInput(''); // Clear input
  };

  // Handle edit button click
  const handleEdit = (user) => {
    setNameInput(user.name);
    setEditId(user.id);
  };

  // Handle delete button click
  const handleDelete = (id) => {
    setUsers(users.filter((user) => user.id !== id));
    if (editId === id) {
      setNameInput('');
      setEditId(null); // Exit edit mode if deleting edited user
    }
  };

  return (
    <div>
      <h2>User Management</h2>

      {/* Form for creating/updating users */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          id="inputName"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Enter name"
        />
        <button id="addNameButton" type="submit">{editId ? 'Update' : 'Add'} User</button>
      </form>

      {/* Table for displaying users */}
      <table style={{ borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '8px' }}>ID</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Name</th>
            {/*
            <th style={{ border: '1px solid black', padding: '8px' }}>Actions</th>
            */}
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="3" style={{ textAlign: 'center', padding: '8px' }}>
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td style={{ border: '1px solid black', padding: '8px' }}>
                  {user.id}
                </td>
                <td style={{ border: '1px solid black', padding: '8px' }}>
                  {user.name}
                </td>
                {/*
                <td style={{ border: '1px solid black', padding: '8px' }}>
                  <button onClick={() => handleEdit(user)}>Edit</button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    style={{ marginLeft: '10px' }}
                  >
                    Delete
                  </button>
                </td>
                */}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
