const myWorker = new Worker('worker.js');

export const WebWorkerTest = () => {
	myWorker.onmessage = message => {
		const { data } = message;
		console.log("got back this data from worker", data);
	}

	console.log("worker", myWorker);



	const handleClick = () => {
		myWorker.postMessage({this: "is a message"})
	}

	return <div onClick={handleClick}>
		I'm a test
	</div>
}
