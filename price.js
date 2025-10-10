document.addEventListener('DOMContentLoaded', () => {

    const simpleCheckboxes = document.querySelectorAll('.item-checkbox:not(#design_sub_check):not(#coding_sub_check)');
    const totalPriceElement = document.getElementById('total-price');
    const ctaButton = document.getElementById('cta-button');

    // --- Elements for sub-page design ---
    const designSubCheck = document.getElementById('design_sub_check');
    const designSubPages = document.getElementById('design_sub_pages');
    const designSubTotal = document.getElementById('design_sub_total');
    const designSubItem = document.getElementById('subpage_design_item');

    // --- Elements for sub-page coding ---
    const codingSubCheck = document.getElementById('coding_sub_check');
    const codingSubPages = document.getElementById('coding_sub_pages');
    const codingSubTotal = document.getElementById('coding_sub_total');
    const codingSubItem = document.getElementById('subpage_coding_item');
    
    // --- Function to update sub-total for dropdown items ---
    function updateSubTotal(selectElement, totalElement) {
        const pages = parseInt(selectElement.value, 10);
        const pricePerOne = parseInt(selectElement.dataset.price, 10);
        totalElement.textContent = (pages * pricePerOne).toLocaleString();
    }
    
    // --- Function to calculate the total price ---
    function calculateTotal() {
        let total = 80000; // Start with the basic fee

        // Calculate for simple checkboxes
        simpleCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                total += parseInt(checkbox.dataset.price, 10);
            }
        });

        // Calculate for sub-page design
        if (designSubCheck.checked) {
            total += parseInt(designSubPages.value, 10) * parseInt(designSubPages.dataset.price, 10);
        }

        // Calculate for sub-page coding
        if (codingSubCheck.checked) {
            total += parseInt(codingSubPages.value, 10) * parseInt(codingSubPages.dataset.price, 10);
        }
        
        // Format number with commas and update the display
        totalPriceElement.textContent = total.toLocaleString();
    }

    // --- Event listeners for simple checkboxes ---
    simpleCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', calculateTotal);
    });

    // --- Event listeners for sub-page design ---
    designSubCheck.addEventListener('change', () => {
        designSubPages.disabled = !designSubCheck.checked;
        designSubItem.style.backgroundColor = designSubCheck.checked ? '#e0f2fe' : 'transparent';
        designSubItem.style.borderColor = designSubCheck.checked ? '#38bdf8' : '#e5e7eb';
        calculateTotal();
    });
    designSubPages.addEventListener('change', () => {
        updateSubTotal(designSubPages, designSubTotal);
        calculateTotal();
    });
    
    // --- Event listeners for sub-page coding ---
    codingSubCheck.addEventListener('change', () => {
        codingSubPages.disabled = !codingSubCheck.checked;
        codingSubItem.style.backgroundColor = codingSubCheck.checked ? '#e0f2fe' : 'transparent';
        codingSubItem.style.borderColor = codingSubCheck.checked ? '#38bdf8' : '#e5e7eb';
        calculateTotal();
    });
    codingSubPages.addEventListener('change', () => {
        updateSubTotal(codingSubPages, codingSubTotal);
        calculateTotal();
    });

    // --- Add event listener to the CTA button ---
    ctaButton.addEventListener('click', () => {
        // !!! IMPORTANT: Change this to your actual email address !!!
        const yourEmail = 'your-email@example.com'; 
        
        const subject = 'Web制作のお見積もり依頼';
        
        let body = 'YAMAMOTO CREATE様\n\n';
        body += 'Webサイト制作の件で、以下の内容にてお見積もりを希望します。\n\n';
        body += '----------\n';
        body += '■ 選択した項目\n';
        body += '・基本料金（¥80,000）\n';

        let selectedItemsTotal = 80000;

        simpleCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const itemName = checkbox.dataset.name;
                const itemPrice = parseInt(checkbox.dataset.price, 10);
                selectedItemsTotal += itemPrice;
                body += `・${itemName}（¥${itemPrice.toLocaleString()}）\n`;
            }
        });
        
        if (designSubCheck.checked) {
            const pages = designSubPages.value;
            const price = parseInt(designSubPages.dataset.price, 10) * pages;
            selectedItemsTotal += price;
            body += `・下層ページデザイン（${pages}ページ）（¥${price.toLocaleString()}）\n`;
        }
        
        if (codingSubCheck.checked) {
            const pages = codingSubPages.value;
            const price = parseInt(codingSubPages.dataset.price, 10) * pages;
            selectedItemsTotal += price;
            body += `・下層ページコーディング（${pages}ページ）（¥${price.toLocaleString()}）\n`;
        }

        body += '----------\n';
        body += `■ 合計金額（税抜）: ¥${selectedItemsTotal.toLocaleString()}\n\n`;
        body += '■ ご相談内容\n';
        body += '（こちらに具体的なご相談内容をご記入ください）\n\n';
        body += '----------\n';
        body += '■ 会社名・お名前：\n';
        body += '■ ご担当者様：\n';
        body += '■ ご連絡先：\n';
        body += '----------\n';

        // Encode subject and body for the mailto link
        const mailtoLink = `mailto:${yourEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        // Open the user's default email client
        window.location.href = mailtoLink;
    });

    // --- Initial calculation on page load ---
    updateSubTotal(designSubPages, designSubTotal);
    updateSubTotal(codingSubPages, codingSubTotal);
    calculateTotal();
});