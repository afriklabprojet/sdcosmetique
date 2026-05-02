#!/bin/bash

echo "🎨 Ouverture des exemples de dashboard admin..."

# Vérifier que le serveur local fonctionne
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Serveur local détecté sur localhost:3000"
    
    echo "📱 Ouverture des 4 options de dashboard:"
    echo "   Option 1 - Sidebar Navigation"
    echo "   Option 2 - Interface Accordéon"  
    echo "   Option 3 - Interface à Onglets"
    echo "   Option 4 - Interface Cartes/Wizard"
    
    # Ouvrir les 4 exemples dans des onglets séparés
    open "http://localhost:3000/admin-option1-sidebar.html"
    sleep 1
    open "http://localhost:3000/admin-option2-accordion.html"
    sleep 1
    open "http://localhost:3000/admin-option3-tabs.html"
    sleep 1
    open "http://localhost:3000/admin-option4-cards.html"
    
    echo "🎯 Tous les exemples sont maintenant ouverts dans votre navigateur !"
else
    echo "❌ Serveur local non disponible. Démarrez d'abord 'npm run dev'"
fi
