document.addEventListener('DOMContentLoaded', () => {
  const roleInput = document.getElementById('role');
  const msgInput = document.getElementById('msg');
  const roleError = document.getElementById('roleError');
  const msgError = document.getElementById('msgError');

  document.getElementById('setRole').onclick = () => {
    const role = roleInput.value;
    roleError.style.display = 'none';

    // Validate role input
    if (!role || ![1, 2, 3].includes(Number(role))) {
      roleError.style.display = 'block';
      return;
    }

    chrome.runtime.sendMessage({ type: 'assignRole', role: Number(role) }, response => {
      if (response.success) {
        roleInput.value = '';
        alert('Role assigned successfully!');
      } else {
        roleError.textContent = response.error || 'Failed to assign role';
        roleError.style.display = 'block';
      }
    });
  };

  document.getElementById('send').onclick = () => {
    const content = msgInput.value.trim();
    msgError.style.display = 'none';

    // Validate message input
    if (!content) {
      msgError.style.display = 'block';
      return;
    }

    chrome.runtime.sendMessage({ type: 'sendToNext', content }, response => {
      if (response.success) {
        msgInput.value = '';
        alert('Message sent successfully!');
      } else {
        msgError.textContent = response.error || 'Failed to send message';
        msgError.style.display = 'block';
      }
    });
  };

  // Add input validation
  roleInput.addEventListener('input', () => {
    roleError.style.display = 'none';
  });

  msgInput.addEventListener('input', () => {
    msgError.style.display = 'none';
  });
}); 