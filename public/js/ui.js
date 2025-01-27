// Работа с DOM, анимации, динамическое создание
export function enableDragAndDrop(dragElement, dropZone, onDropCallback) {
    dragElement.draggable = true;
  
    dragElement.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', dragElement.id);
    });
  
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
    });
  
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      const id = e.dataTransfer.getData('text/plain');
      if (id === dragElement.id) {
        // Успешно, вызываем колбэк
        onDropCallback();
      }
    });
  }
  