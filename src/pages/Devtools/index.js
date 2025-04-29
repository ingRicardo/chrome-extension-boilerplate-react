chrome.devtools.panels.create(
  'Dev Tools from chrome-extension-boilerplate-react',
  'icon-34.png',
  'panel.html',
  function (panel) {
    // The 'panel' object is the created panel, you can use it to access the panel's window
    panel.onShown.addListener(function (window) {
      // Do something when the panel is shown

      console.log('Panel shown!');

      const saveButton = window.document.getElementById('saveOverride');
      const urlInput = window.document.getElementById('urlPattern');
      const payloadTextarea = window.document.getElementById('overridePayload');
      const statusDiv = window.document.getElementById('status');
      const overrideListDiv = window.document.getElementById('overrideList');

      loadOverrideList(window, saveButton, urlInput, payloadTextarea, statusDiv, overrideListDiv);

      // Event listener for the save button

      saveButton.onclick = function () {

        if (saveButton.dataset.editId) {
          //update
          const id = saveButton.dataset.editId;
          const url = urlInput.value.trim();
          const payload = payloadTextarea.value.trim();
          window.chrome.runtime.sendMessage({
            action: 'updateOverride',
            id: id,
            urlPattern: url,
            overridePayload: payload
          }, (response) => {
            if (response && response.success) {
              statusDiv.textContent = 'Override rule updated successfully!';
              statusDiv.style.color = 'green';
              urlInput.value = '';        // Clear the form
              payloadTextarea.value = '';  // Clear the form
              saveButton.textContent = "Add Override Rule"; //reset the button
              delete saveButton.dataset.editId;
              loadOverrideList(window, saveButton, urlInput, payloadTextarea, statusDiv, overrideListDiv);
            } else {
              statusDiv.textContent = response ? response.error : 'Failed to update override rule.';
              statusDiv.style.color = 'red';
            }
          })
        }
        else {

          saveOverrideRule(window, saveButton, urlInput, payloadTextarea, statusDiv, overrideListDiv);
        }
      };

    });
  }
);

// Function to load and display the override rules from storage
function loadOverrideList(window, saveButton, urlInput, payloadTextarea, statusDiv, overrideListDiv) {
  window.chrome.runtime.sendMessage({ action: 'getOverrides' }, (response) => {


    if (response && response.overrides) {
      const overrides = response.overrides;
      overrideListDiv.innerHTML = '<h3>Active Overrides</h3>'; // Clear old list

      if (Object.keys(overrides).length === 0) {
        overrideListDiv.innerHTML += '<p>No overrides defined yet.</p>';
        return;
      }

      for (const id in overrides) {
        const override = overrides[id];
        const itemDiv = window.document.createElement('div');
        itemDiv.className = 'override-item';
        itemDiv.dataset.overrideId = id; // Store ID for actions

        const urlSpan = window.document.createElement('span');
        urlSpan.textContent = override.urlPattern;
        urlSpan.className = override.isActive ? 'override-active' : 'override-inactive';
        itemDiv.appendChild(urlSpan);

        const actionsDiv = window.document.createElement('div');
        actionsDiv.className = 'override-actions';

        const editButton = window.document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'edit';

        editButton.onclick = function () {

          // Populate the form with the override data for editing
          urlInput.value = override.urlPattern;
          payloadTextarea.value = override.payload;
          //  You might want to change the button text to "Update Override"
          saveButton.textContent = "Update Override";
          // Store the ID of the override being edited.  You'll need this.
          saveButton.dataset.editId = id;


        }


        actionsDiv.appendChild(editButton);


        const toggleButton = window.document.createElement('button');
        toggleButton.textContent = override.isActive ? 'Disable' : 'Enable';
        toggleButton.className = override.isActive ? 'disable' : 'enable';


        toggleButton.onclick = function () {
          window.chrome.runtime.sendMessage({
            action: 'toggleOverride',
            id: id
          }, () => {
            loadOverrideList(window, saveButton, urlInput, payloadTextarea, statusDiv, overrideListDiv); // Refresh the list to show updated state
          });

        }


        actionsDiv.appendChild(toggleButton);

        const deleteButton = window.document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete';


        deleteButton.onclick = function () {

          window.chrome.runtime.sendMessage({
            action: 'deleteOverride',
            id: id
          }, () => {
            loadOverrideList(window, saveButton, urlInput, payloadTextarea, statusDiv, overrideListDiv); // Refresh the list
          });

        }




        deleteButton.addEventListener('click', () => {

        });
        actionsDiv.appendChild(deleteButton);

        itemDiv.appendChild(actionsDiv);
        overrideListDiv.appendChild(itemDiv);
      }
    } else {
      overrideListDiv.innerHTML = '<p>Error loading overrides.</p>';
    }



  });
}


// Function to save the override rule (sends message to background)
function saveOverrideRule(window, saveButton, urlInput, payloadTextarea, statusDiv, overrideListDiv) {
  const url = urlInput.value.trim();
  const payload = payloadTextarea.value.trim();

  if (url && payload) {
    try {
      JSON.parse(payload); // Validate JSON
      // Send message to the background script to handle the override logic
      window.chrome.runtime.sendMessage({
        action: 'addOverride',
        urlPattern: url,
        overridePayload: payload
      }, (response) => {
        if (response && response.success) {
          statusDiv.textContent = 'Override rule added successfully!';
          statusDiv.style.color = 'green';
          urlInput.value = '';        // Clear the form
          payloadTextarea.value = '';  // Clear the form
          loadOverrideList(window, saveButton, urlInput, payloadTextarea, statusDiv, overrideListDiv); // Update the list in the UI
        } else {
          statusDiv.textContent = response ? response.error : 'Failed to add override rule.';
          statusDiv.style.color = 'red';
        }
      });
    } catch (e) {
      statusDiv.textContent = 'Invalid JSON payload. Please check your JSON syntax.';
      statusDiv.style.color = 'red';
    }
  } else {
    statusDiv.textContent = 'Please enter both a URL and a payload.';
    statusDiv.style.color = 'red';
  }
}