






document.addEventListener('DOMContentLoaded', () => {



    



    
function formatearDia(dia) {
    const diasRojos = ["DOMINGO", "LUNES - FESTIVO", "SABADO - FESTIVO",];
    if (diasRojos.includes(dia)) {
        return `<span style="color: #ff0000; font-weight: bold;">${dia}</span>`;
    }
    return dia;
}






    


    
    

    // Base de datos de Jampier (NO editable)
    const jampierDatabase = [






        
        

{ 
    day: formatearDia("DOMINGO"), 
    date: "2 De Noviembre 2025", 
    time: "7AM a 9PM", 
    completed: true,
    isJampier: true
},



        


        
          { 
            
            day: formatearDia("LUNES - FESTIVO"), 
            date: "3 De Noviembre 2025", 
            time: "7AM a 9PM", 
            completed: true,
            isJampier: true  // Identificador
            
        },



        
           { 
            
            day: formatearDia("SABADO"),
            date: "8 De Noviembre 2025", 
            time: "11AM a 9PM", 
            completed: true,
            isJampier: true  // Identificador
            
        },

//
        
        
  







        
  ];


















        






// TEXTO FINAL ANIMADO Y DE TODO 














// Crear el elemento con el texto dorado animado
const textoDorado = document.createElement('div');
textoDorado.innerHTML = '... ok ...';
textoDorado.style.color = '#FFD700';
textoDorado.style.fontSize = '3.5em';
textoDorado.style.fontWeight = 'bold';
textoDorado.style.textAlign = 'center';
textoDorado.style.fontFamily = 'Arial, sans-serif';
textoDorado.style.padding = '50px';
textoDorado.style.textShadow = `
    0 0 10px rgba(255, 215, 0, 0.8),
    0 0 20px rgba(255, 215, 0, 0.6),
    0 0 30px rgba(255, 215, 0, 0.4)
`;
textoDorado.style.background = 'linear-gradient(45deg, #000000, #1a1a1a)';
textoDorado.style.borderRadius = '15px';
textoDorado.style.margin = '50px auto';
textoDorado.style.maxWidth = '600px';
textoDorado.style.opacity = '0';
textoDorado.style.transform = 'translateY(50px)';
textoDorado.style.transition = 'all 2s ease-in-out';

// Agregar al body
document.body.appendChild(textoDorado);

// Animación de entrada suave
setTimeout(() => {
    textoDorado.style.opacity = '1';
    textoDorado.style.transform = 'translateY(0)';
}, 100);

// Efecto de brillo pulsante continuo
setInterval(() => {
    textoDorado.style.textShadow = `
        0 0 10px rgba(255, 215, 0, 0.8),
        0 0 20px rgba(255, 215, 0, 0.6),
        0 0 30px rgba(255, 215, 0, 0.4),
        0 0 40px rgba(255, 215, 0, 0.2)
    `;
    
    setTimeout(() => {
        textoDorado.style.textShadow = `
            0 0 5px rgba(255, 215, 0, 0.9),
            0 0 15px rgba(255, 215, 0, 0.7),
            0 0 25px rgba(255, 215, 0, 0.5)
        `;
    }, 1500);
}, 3000);







        


  



    // Elementos del DOM
    const dayInput = document.getElementById('day');
    const dateInput = document.getElementById('date');
    const timeInput = document.getElementById('time');
    const saveBtn = document.getElementById('saveBtn');
    const dataList = document.getElementById('dataList');
    const modal = document.getElementById('modal');
    const modalText = document.getElementById('modalText');
    const closeModal = document.querySelector('.close-modal');

    // Cargar datos al iniciar
    loadData();

    // Guardar datos en localStorage (solo datos de usuario)
    saveBtn.addEventListener('click', () => {
        const day = dayInput.value.trim();
        const date = dateInput.value.trim();
        const time = timeInput.value.trim();

        if (!day || !date || !time) {
            showModal('⚠️ Todos los campos son obligatorios');
            return;
        }

        const newData = { day, date, time, completed: false, isJampier: false };
        saveToLocalStorage(newData);
        renderData();
        clearInputs();
        showModal('✅ Turno guardado (solo en este dispositivo)');
    });

    // Cargar y combinar datos (Jampier + localStorage)
    function loadData() {
        if (!localStorage.getItem('asovicobe_data')) {
            localStorage.setItem('asovicobe_data', JSON.stringify([]));
        }
        renderData();
    }

    // Renderizar TODOS los datos
    function renderData() {
        dataList.innerHTML = '';
        const userData = JSON.parse(localStorage.getItem('asovicobe_data')) || [];
        const allData = [...jampierDatabase, ...userData]; // Combinar

        allData.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div>
                    <strong>${item.day}</strong><br>
                    <span>${item.date} | ${item.time}</span>
                </div>
                <div class="actions">
                    <button class="complete" onclick="toggleComplete(${index}, ${item.isJampier})">
                        <i class="fas fa-${item.completed ? 'check-circle' : 'circle'}"></i>
                    </button>
                    ${item.isJampier ? '' : `<button class="delete" onclick="deleteData(${index})">
                        <i class="fas fa-times"></i>
                    </button>`}
                </div>
            `;
            if (item.completed) {
                li.style.opacity = '0.7';
                li.style.borderLeft = '4px solid var(--success)';
            }
            dataList.appendChild(li);
        });
    }

    // Guardar en localStorage (datos de usuario)
    function saveToLocalStorage(data) {
        let userData = JSON.parse(localStorage.getItem('asovicobe_data')) || [];
        userData.push(data);
        localStorage.setItem('asovicobe_data', JSON.stringify(userData));
    }

    // ----- Funciones Globales -----
    // Marcar como completado
    window.toggleComplete = (index, isJampier) => {
        if (isJampier) {
            showModal('❌ No puedes modificar ni eliminar estos datos de la base de datos de Jampier.');
            return;
        }
        let userData = JSON.parse(localStorage.getItem('asovicobe_data')) || [];
        userData[index - jampierDatabase.length].completed = !userData[index - jampierDatabase.length].completed;
        localStorage.setItem('asovicobe_data', JSON.stringify(userData));
        renderData();
    };

    // Eliminar dato (solo datos de usuario)
    window.deleteData = (index) => {
        let userData = JSON.parse(localStorage.getItem('asovicobe_data')) || [];
        userData.splice(index - jampierDatabase.length, 1);
        localStorage.setItem('asovicobe_data', JSON.stringify(userData));
        renderData();
        showModal('🗑️ Turno eliminado');
    };

    // ----- Helpers -----
    function showModal(message) {
        modalText.textContent = message;
        modal.style.display = 'flex';
    }

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    function clearInputs() {
        dayInput.value = '';
        dateInput.value = '';
        timeInput.value = '';
    }
});
