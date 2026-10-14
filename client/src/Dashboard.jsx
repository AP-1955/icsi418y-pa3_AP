import React, { useState, useEffect } from 'react';

export default function Dashboard({ onLogout }) {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  
  // Create Project Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Planning');
  const [projectLeadId, setProjectLeadId] = useState('');
  const [message, setMessage] = useState('');

  // Selected Project for Membership Management
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [memberToAdd, setMemberToAdd] = useState('');
  const [membershipMsg, setMembershipMsg] = useState('');

  // Fetch users and projects on load
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userRes = await fetch('http://localhost:5000/api/users');
      const userData = await userRes.json();
      setUsers(userData);
      if (userData.length > 0) setProjectLeadId(userData[0]._id);

      const projRes = await fetch('http://localhost:5000/api/projects');
      const projData = await projRes.json();
      setProjects(projData);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  // Handle Project Creation
  const handleCreateProject = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          status,
          project_lead_id: projectLeadId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create project');

      setMessage('Project created successfully!');
      setName('');
      setDescription('');
      fetchData();
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Load Project Members
  const handleSelectProject = async (proj) => {
    setSelectedProject(proj);
    setMembershipMsg('');
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${proj._id}/members`);
      const data = await res.json();
      if (res.ok) {
        setProjectMembers(data.members);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  };

  // Add Member
  const handleAddMember = async (e) => {
    e.preventDefault();
    setMembershipMsg('');
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${selectedProject._id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: memberToAdd })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add member');

      setMembershipMsg('Member added successfully!');
      handleSelectProject(selectedProject);
    } catch (err) {
      setMembershipMsg(err.message);
    }
  };

  // Remove Member
  const handleRemoveMember = async (userId) => {
    setMembershipMsg('');
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${selectedProject._id}/members/${userId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove member');

      setMembershipMsg('Member removed successfully!');
      handleSelectProject(selectedProject);
    } catch (err) {
      setMembershipMsg(err.message);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Project Management Dashboard</h2>
      <button onClick={onLogout} style={{ float: 'right' }}>Log Out</button>
      <hr style={{ clear: 'both', margin: '20px 0' }} />

      {/* CREATE PROJECT */}
      <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
        <h3>Create New Project</h3>
        <form onSubmit={handleCreateProject}>
          <div>
            <label>Project Name: </label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>Description: </label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>Status: </label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>Project Lead: </label>
            <select value={projectLeadId} onChange={(e) => setProjectLeadId(e.target.value)}>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.f_name} {u.l_name} ({u.username})
                </option>
              ))}
            </select>
          </div>
          <button type="submit" style={{ marginTop: '10px' }}>Create Project</button>
        </form>
        {message && <p style={{ color: message.includes('success') ? 'green' : 'red' }}>{message}</p>}
      </div>

      {/* PROJECT LIST */}
      <div>
        <h3>Existing Projects</h3>
        {projects.length === 0 ? <p>No projects found.</p> : (
          <ul>
            {projects.map((proj) => (
              <li key={proj._id} style={{ marginBottom: '10px' }}>
                <strong>{proj.name}</strong> [{proj.status}] - {proj.description} 
                <br />
                <em>Lead: {proj.project_lead_id ? `${proj.project_lead_id.f_name} ${proj.project_lead_id.l_name}` : 'Unknown'}</em>
                <button onClick={() => handleSelectProject(proj)} style={{ marginLeft: '15px' }}>
                  Manage Members
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* MEMBERSHIP MANAGEMENT */}
      {selectedProject && (
        <div style={{ background: '#eef2f5', padding: '15px', borderRadius: '5px', marginTop: '30px' }}>
          <h3>Manage Members for: {selectedProject.name}</h3>
          <h4>Current Members:</h4>
          <ul>
            {projectMembers.map((m) => {
              const isLead = selectedProject.project_lead_id._id === m._id || selectedProject.project_lead_id === m._id;
              return (
                <li key={m._id}>
                  {m.f_name} {m.l_name} ({m.username}) {isLead && <strong>[Lead]</strong>}
                  {!isLead && (
                    <button onClick={() => handleRemoveMember(m._id)} style={{ marginLeft: '10px', color: 'red' }}>
                      Remove
                    </button>
                  )}
                </li>
              );
            })}
          </ul>

          <h4 style={{ marginTop: '15px' }}>Add Member</h4>
          <form onSubmit={handleAddMember}>
            <select value={memberToAdd} onChange={(e) => setMemberToAdd(e.target.value)} required>
              <option value="">Select user to add...</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>{u.f_name} {u.l_name} ({u.username})</option>
              ))}
            </select>
            <button type="submit" style={{ marginLeft: '10px' }}>Add to Project</button>
          </form>
          {membershipMsg && <p style={{ color: membershipMsg.includes('success') ? 'green' : 'red' }}>{membershipMsg}</p>}
        </div>
      )}
    </div>
  );
}