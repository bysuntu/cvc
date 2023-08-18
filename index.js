const sourceUrl =
  "https://api.onedrive.com/v1.0/shares/u!aHR0cHM6Ly8xZHJ2Lm1zL2YvcyFBaTBQZzlMZlpRWWJpTnRyelBqY3R3eGJLSHNueWc_ZT1MQjVTeDE=/root?expand=children";

async function getFile(dirTree) {
  let url_ = dirTree.shift()
  let info_ = await fetch(url_);
  let json_ = await info_.json();

  json_.children.forEach((v)=>{
    
    if (v.name === dirTree[0]){
        console.log(v.name)
        const {'@content.downloadUrl':url__} = v
        url_ = url__
    }
  })
  return url_
}

const container = document.querySelector("#container");


// VTK renderWindow/renderer
const renderWindow = vtk.Rendering.Core.vtkRenderWindow.newInstance();
const renderer = vtk.Rendering.Core.vtkRenderer.newInstance();
renderer.setBackground(0.8, 0.8, 0.8)
renderWindow.addRenderer(renderer);

// WebGL/OpenGL impl
const openGLRenderWindow = vtk.Rendering.OpenGL.vtkRenderWindow.newInstance();
openGLRenderWindow.setContainer(container);
openGLRenderWindow.setSize(900, 900);
renderWindow.addView(openGLRenderWindow);

// Interactor
const interactor = vtk.Rendering.Core.vtkRenderWindowInteractor.newInstance();
interactor.setView(openGLRenderWindow);
interactor.initialize();
interactor.bindEvents(container);

// Interactor style
const trackball = vtk.Interaction.Style.vtkInteractorStyleTrackballCamera.newInstance();
interactor.setInteractorStyle(trackball);

async function vtkReader(filename){
	filename = await getFile(filename)
    let reader = vtk.IO.Legacy.vtkPolyDataReader.newInstance();
    reader.setUrl(filename)
	await reader.loadData()
	return reader
}

async function showResult(fileName, color, opacity=0.5){
	const reader = await vtkReader(fileName)
	
	const actor = vtk.Rendering.Core.vtkActor.newInstance();
	const mapper = vtk.Rendering.Core.vtkMapper.newInstance();

	actor.getProperty().setColor(...color)
	actor.getProperty().setOpacity(opacity)
	actor.setMapper(mapper);
	
	mapper.setInputConnection(reader.getOutputPort());

	renderer.addActor(actor);

	renderer.resetCamera();
	renderWindow.render();

	console.log(renderer)
}

async function renderResult(pid){
	const cathFile = [sourceUrl, `${pid}_cath.vtk`]
	const boneFile = [sourceUrl, `${pid}_bone.vtk`]
	const cvFile = [sourceUrl, `${pid}_cv.vtk`]
	console.log(cathFile)
	renderer.removeAllActors();
	showResult(cathFile, [0, 1, 0], 0.8)
	showResult(cvFile, [1, 0, 0], 0.5)
	showResult(boneFile, [0, 0.1, 0.3], 0.05)
}

renderResult('118')

const caseSelector = document.querySelectorAll('.pid')

caseSelector.forEach((p)=>{
	console.log(p)
	p.addEventListener('click', ()=>{
		console.log(p.textContent.split(' ')[1])
		caseSelector.forEach((p)=>{p.setAttribute('class', 'pid')})
		p.classList.add('active')
		renderResult(p.textContent.split(' ')[1])
	})
})






