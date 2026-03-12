const contractAddress = "0xc95305F9a576A46915952A5C8eDEc1402B900AdC"; 

const abi = [
    { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
    { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "studentName", "type": "string" } ], "name": "DiplomaIssued", "type": "event" },
    { "inputs": [], "name": "admin", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" },
    { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "diplomas", "outputs": [ { "internalType": "uint256", "name": "id", "type": "uint256" }, { "internalType": "string", "name": "studentName", "type": "string" }, { "internalType": "string", "name": "major", "type": "string" }, { "internalType": "string", "name": "classification", "type": "string" }, { "internalType": "uint256", "name": "issueDate", "type": "uint256" }, { "internalType": "bool", "name": "isValid", "type": "bool" } ], "stateMutability": "view", "type": "function" },
    { "inputs": [ { "internalType": "uint256", "name": "_id", "type": "uint256" }, { "internalType": "string", "name": "_name", "type": "string" }, { "internalType": "string", "name": "_major", "type": "string" }, { "internalType": "string", "name": "_class", "type": "string" } ], "name": "issueDiploma", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [ { "internalType": "uint256", "name": "_id", "type": "uint256" } ], "name": "verifyDiploma", "outputs": [ { "internalType": "string", "name": "", "type": "string" }, { "internalType": "string", "name": "", "type": "string" }, { "internalType": "string", "name": "", "type": "string" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }
];

let web3; let contract;

window.addEventListener('load', async () => {
    if (window.ethereum) web3 = new Web3(window.ethereum);
    else web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
    try {
        contract = new web3.eth.Contract(abi, contractAddress);
        if(document.getElementById("walletAddress")) checkConnectedWallet();
    } catch (e) { console.error(e); }
});

async function connectWallet() {
    if (!window.ethereum) return alert("Cần cài MetaMask!");
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    document.getElementById("walletAddress").innerText = "Đã kết nối: " + accounts[0];
    document.getElementById("walletAddress").className = "badge bg-success p-2";
}

async function checkConnectedWallet() {
    const accounts = await web3.eth.getAccounts();
    if (accounts.length > 0) {
        document.getElementById("walletAddress").innerText = "Đã kết nối: " + accounts[0];
        document.getElementById("walletAddress").className = "badge bg-success p-2";
    }
}

// ADMIN: CẤP BẰNG
async function issueDiploma() {
    const name = document.getElementById("nameInput").value;
    const major = document.getElementById("majorInput").value;
    const classification = document.getElementById("classInput").value;
    if (!name || !major) return alert("Vui lòng nhập đủ thông tin!");

    // Tự sinh ID theo thời gian
    const autoID = Math.floor(Date.now() / 1000);

    try {
        const accounts = await web3.eth.getAccounts();
        const receipt = await contract.methods.issueDiploma(autoID, name, major, classification).send({ from: accounts[0] });
        
        document.getElementById("successArea").style.display = "block";
        document.getElementById("generatedID").innerText = autoID;
        document.getElementById("txHashDisplay").innerText = receipt.transactionHash;
        alert("✅ Cấp bằng thành công!");
    } catch (error) {
        console.error(error); alert("Lỗi! Kiểm tra lại ví Admin.");
    }
}

// TRA CỨU BẰNG CẤP
async function verifyDiploma() {
    const id = document.getElementById("searchId").value;
    if (!id) return alert("Vui lòng nhập ID!");

    if(document.getElementById("resultArea")) document.getElementById("resultArea").style.display = "none";

    try {
        const data = await contract.methods.verifyDiploma(id).call();
        const isValid = data[4];

        // Dành cho trang Nhà Tuyển Dụng
        if (document.getElementById("mainStatus")) {
            document.getElementById("resultArea").style.display = "block";
            const statusBox = document.getElementById("statusBox");
            if (isValid) {
                statusBox.className = "p-4 rounded-3 text-center text-white mb-4 shadow-sm bg-success";
                document.getElementById("mainStatus").innerText = "VERIFIED";
                document.getElementById("subMessage").innerText = "Văn bằng hợp lệ và tồn tại trên hệ thống.";
                document.getElementById("detailBox").style.display = "block";
                document.getElementById("resName").innerText = data[0];
                document.getElementById("resMajor").innerText = data[1];
                document.getElementById("resClass").innerText = data[2];
                document.getElementById("resDate").innerText = new Date(data[3] * 1000).toLocaleDateString("vi-VN");
            }
        }

        // Dành cho trang Sinh Viên (Chỉ lấy dữ liệu)
        if (document.getElementById("resName") && !document.getElementById("mainStatus")) {
            document.getElementById("resName").innerText = data[0];
            document.getElementById("resMajor").innerText = data[1];
            document.getElementById("resClass").innerText = data[2];
            document.getElementById("resDate").innerText = new Date(data[3] * 1000).toLocaleDateString("vi-VN");
            if(document.getElementById("qrCodeImage")){
                document.getElementById("qrCodeImage").src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${id}`;
            }
        }
    } catch (error) {
        if (document.getElementById("mainStatus")) {
            document.getElementById("resultArea").style.display = "block";
            document.getElementById("statusBox").className = "p-4 rounded-3 text-center text-white mb-4 shadow-sm bg-danger";
            document.getElementById("mainStatus").innerText = "INVALID";
            document.getElementById("subMessage").innerText = "Không tìm thấy dữ liệu!";
            document.getElementById("detailBox").style.display = "none";
        } else {
            alert("Không tìm thấy văn bằng mã số: " + id);
        }
    }
}
function studentCheck() { verifyDiploma(); }