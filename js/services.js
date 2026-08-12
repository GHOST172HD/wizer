const root=document.querySelector('#services-list');
if(root){root.innerHTML=SERVICES.map(group=>`<section class="service-group">
    <div class="section-heading"><h2>${group.category}</h2></div>
    <div class="cards-grid three-cols">${group.items.map(item=>`<article class="card">
        <h3>${item.name}</h3>
        <p>${item.price}</p>
        <p class="salon-meta">Durée : ${item.duration}</p>
        <a class="text-link" href="reservation.html?service=${encodeURIComponent(item.name)}">Réserver</a></article>`).join('')}</div></section>`).join('');}
