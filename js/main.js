window.example = {
  firstname: 'Parent',
  lastname: 'Parent',
  children: [
    {
      firstname: 'Child 1',
      lastname: 'Child 1',
    },
    {
      firstname: 'Child 2',
      lastname: 'Child 2',
      children: [
        {
          firstname: 'Child 3',
          lastname: 'Child 3',
          children: [
            {
              firstname: 'Child 5',
              lastname: 'Child 5',
            },
            {
              firstname: 'Child 6',
              lastname: 'Child 6',
              children: [
                {
                  firstname: 'Child 7',
                  lastname: 'Child 7',
                },
                {
                  firstname: 'Child 8',
                  lastname: 'Child 8',
                },
              ],
            },
          ],
        },
        {
          firstname: 'Child 4',
          lastname: 'Child 4',
        },
      ],
    },
  ],
};

window.currentNode = null;
window.rootNode = null;

const init = () => {
  const modalClose = document.getElementById('modalClose');
  const modalForm = document.getElementById('modalForm');
  const editNode = document.getElementById('editNode');
  const remove = document.getElementById('remove');
  const dropArea = document.getElementById('dropArea');
  const image = document.getElementById('image');
  const imageInput = document.getElementById('imageInput');
  const selectFile = document.getElementById('selectFile');
  const resetImage = document.getElementById('resetImage');
  const firstname = document.getElementById('firstname');
  const lastname = document.getElementById('lastname');
  const switchView = document.getElementById('switch-view');
  const btnEdit = document.getElementById('btnEdit');
  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const highlight = () => {dropArea.classList.add('highlight');};
  const unhighlight = () => {dropArea.classList.remove('highlight');};
  const handleDrop = (e) => {
    let file;
    if (e.target.files) {
      file = e.target.files[0];
    } else {
      file = e.dataTransfer.files[0];
    }
    const fileReader = new FileReader();
    fileReader.addEventListener('load', (e) => {
      image.src = e.target.result;
      dropArea.classList.add('dropped');
    });
    fileReader.readAsDataURL(file);
  };

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
  });
  btnEdit.addEventListener('click', function(){
    document.getElementById('editFirstname').value = window.currentNode.data.firstname;
    document.getElementById('editLastname').value = window.currentNode.data.lastname;
  });
  dropArea.addEventListener('drop', handleDrop, false);
  imageInput.addEventListener('change', handleDrop, false);
  selectFile.addEventListener('click', () => imageInput.click(), false);
  resetImage.addEventListener('click', () => {
    dropArea.classList.remove('dropped');
    image.src = '';
    imageInput.value = '';
  });
  modalClose.addEventListener('click', () => {
    dropArea.classList.remove('dropped');
    image.src = '';
    imageInput.value = '';
    firstname.value = '';
    // lastname.value = '';
  }, true);

  switchView.addEventListener('click', () => {
    for (const element of document.getElementsByClassName('view')) {
      element.classList.toggle('active');
    }
  }, false);
  modalForm.addEventListener('submit', addMember, true);
  remove.addEventListener('click', removeMember, true);
  editForm.addEventListener('submit', editMember, true);
  initTree();
  visualize();
};

const initTree = () => {
  const canvas = document.getElementById('canvas');
  window.context = canvas.getContext('2d');
  canvas.addEventListener('click', (event) => {
    const x = event.pageX - canvas.offsetLeft;
    const y = event.pageY - canvas.offsetTop;
    for (const node of getNodes(window.rootNode)) {
      if (x > node.xPos && y > node.yPos && x < node.xPos + node.width && y < node.yPos + node.height) {
        handleSelection(node, window.currentNode);
        break;
      }
    }
  }, false);

  canvas.addEventListener('mousemove', (event) => {
    const x = event.pageX - canvas.offsetLeft;
    const y = event.pageY - canvas.offsetTop;
    for (const node of getNodes(window.rootNode)) {
      if (x > node.xPos && y > node.yPos && x < node.xPos + node.width && y < node.yPos + node.height) {
        canvas.style.cursor = 'pointer';
        break;
      }
      else {
        canvas.style.cursor = 'auto';
      }
    }
  }, false);

  context.canvas.width = document.getElementById('main').offsetWidth;
  context.canvas.height = document.getElementById('main').offsetHeight;
  window.rootNode = populate();
  window.currentNode = window.rootNode;
  window.currentNode.data.selected = true;
  TREE.draw(context, window.rootNode);
};

const handleSelection = (node) => {
  window.currentNode.selected(false);
  window.currentNode.data.selected = false;
  node.selected(true);
  node.data.selected = true;
  window.currentNode = node;
  TREE.clear(context);
  TREE.draw(context, window.rootNode);
  memberSelect(node.data);
  visualize();
};

const addMember = (e) => {
  e.preventDefault();
  const image = document.getElementById('image').src;
  const newNode = {
    firstname: document.getElementById('firstname').value,
    lastname: document.getElementById('lastname').value,
    image: image.startsWith('http') ? null : image,
  };
  const currentNodeData = window.currentNode.data;
  window.currentNode.addChild(appendChild(createdChild(newNode), newNode));
  if (currentNodeData.children) {
    currentNodeData.children.push(newNode);
  } else {
    currentNodeData.children = [newNode];
  }
  document.getElementById('modalClose').click();
  TREE.clear(context);
  TREE.draw(context, window.rootNode);
  visualize();
};

const removeMember = () => {
  const current = window.currentNode.data;
  const parent = window.currentNode.parentTree;
  _.remove(parent.data.children, (child) => child.firstname === current.firstname && child.lastname === current.lastname && child.image === current.image && child.children === current.children);
  TREE.destroy(window.currentNode);
  handleSelection(window.rootNode);
  visualize();
};

const editMember = (e) => {

  e.preventDefault();
  let editFirstname = document.getElementById('editFirstname').value,
      editLastname = document.getElementById('editLastname').value;
  window.currentNode.data.firstname = editFirstname;
  window.currentNode.data.lastname = editLastname;
  current = window.currentNode;
  memberSelect(current);
  window.rootNode = populate();
  // window.currentNode = current;
  // window.currentNode.selected = true;
  // window.currentNode.data.selected = true;
  TREE.clear(context);
  TREE.draw(context, window.rootNode);
  visualize();
};

const getNodes = (node) => node ? TREE.getNodeList(node) : [];

const createdChild = ({ firstname, lastname, image }) => TREE.create(firstname + ' ' + lastname);
const memberSelect = (member) => {
  const firstname = document.getElementById('sidebar-info-firstname');
  const lastname = document.getElementById('sidebar-info-lastname');
  const image = document.getElementById('sidebar-info-image');
  // member.firstname="sase";
  // console.log(TREE);
  firstname.innerHTML = member.firstname || '';
  lastname.innerHTML = member.lastname || '';
  image.src = member.image ? member.image : 'assets/placeholder.svg';
};

const populate = (node, member) => {
  if (!node) {
    node = createdChild(example);
    member = example;
  }
  node.selected(true);
  memberSelect(member);
  return appendChild(node, member);
};

const appendChild = (node, member) => {
  node.data = member;
  if (member.children) {
    member.children.forEach(child => node.addChild(appendChild(createdChild(child), child)));
  }

  return node;
};

const renderChild = ({ firstname, lastname, image, selected }) =>
  `
    <div class="child-holder">
        <div class="child ${selected ? 'selected' : ''}" onclick="setSelectedNode(this)">
            <img src="${image ? image : 'assets/placeholder.svg'}" alt="Picture">
            <p>${firstname} ${lastname}</p>
        </div>
    </div>
  `;

const render = (node, index = 0) => {
  const result = renderChild(node);
  if (node.children) {
    return result.concat(`<div class="siblings-container level-${index % 2}">` + node.children.map(child => render(child, index + 1)).join('') + '</div>');
  }

  return result;
};

var setSelectedNode = function (element) {
    window.currentNode.selected(false);
    window.currentNode.data.selected = false;
    var node = getNodeByName(element.lastElementChild.textContent)
    node.selected(true);
    node.data.selected = true;
    window.currentNode = node;
    TREE.clear(context);
    TREE.draw(context, window.rootNode);
    memberSelect(node.data);
    visualize();
};

var getNodeByName = function (name) {
    for (const node of getNodes(window.rootNode)) {
        if (node.text === name){
          return node;
        }
    }
};

const visualize = () => document.getElementById('visual-context').innerHTML = render(window.rootNode.data);
