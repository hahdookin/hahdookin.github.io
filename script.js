const selectedFile = document.getElementById('input').files[0];

if (selectedFile) {
    document.getElementById('output').innerHTML = selectedFile.name;
}