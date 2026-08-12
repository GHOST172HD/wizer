const menuToggle=document.querySelector('.menu-toggle');
const menu=document.querySelector('.main-menu');
if(menuToggle&&menu){menuToggle.addEventListener('click',()=>{const open=menu.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded',String(open));
    menuToggle.textContent=open?'✕':'☰';});}document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
