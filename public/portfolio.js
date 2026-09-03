document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        name: document.querySelector('#name').value,
        email: document.querySelector('#email').value,
        message: document.querySelector('#message').value
    };

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Message sent successfully!');
            document.querySelector('form').reset();
        } else {
            alert(
                'Error: ' +
                (result.errors
                    ? result.errors[0].msg
                    : result.error)
            );
        }

    } catch (error) {
        console.error('Connection failed:', error);
        alert('Could not connect to the server.');
    }
});