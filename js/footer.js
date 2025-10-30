// Load the footer.html file using JavaScript
fetch('partials/footer.html')
  .then(response => response.text())
  .then(data => {
    const footer = document.getElementById('site-footer');
    footer.innerHTML = data;
    footer.style.display = 'block';
  })
  .catch(error => console.error('Error loading footer:', error));
