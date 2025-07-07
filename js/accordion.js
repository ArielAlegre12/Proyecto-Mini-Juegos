export function setupAccordion() {
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const currentItem = header.closest('.accordion-item');
      const content = currentItem.querySelector('.accordion-content');

      // Cierra todos los acordeones abiertos excepto el actual
      document.querySelectorAll('.accordion-content.active').forEach(item => {
        if (item !== content) {
          item.classList.remove('active');
        }
      });

      // Alterna la clase 'active' para el acordeón actual
      content.classList.toggle('active');
    });
  });
}
