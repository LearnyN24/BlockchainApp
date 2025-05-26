import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar_Logout from "./NavBar_Logout";
import Web3 from "web3";
import DiagnosticForm from "../build/contracts/DiagnosticForm.json";
import { ipfs, gatewayUrl, testConnection } from "../config/ipfsConfig";

function DiagnosticFormComponent() {
  const { hhNumber } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ipfsStatus, setIpfsStatus] = useState("Checking IPFS connection...");
  const [formData, setFormData] = useState({
    recordId: "",
    doctorName: "",
    patientName: "",
    age: "",
    gender: "",
    bloodGroup: "",
    diagnosticAddress: "",
    patientAddress: "",
    reportFile: null
  });

  // Test IPFS connection on component mount
  useEffect(() => {
    const checkIPFSConnection = async () => {
      const isConnected = await testConnection();
      if (isConnected) {
        setIpfsStatus("IPFS node connected successfully");
      } else {
        setIpfsStatus("IPFS node connection failed");
        setError('IPFS node is not accessible. Please make sure IPFS daemon is running at http://127.0.0.1:5001');
      }
    };
    checkIPFSConnection();
  }, []);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setFormData(prev => ({
            ...prev,
            diagnosticAddress: accounts[0]
          }));
        } catch (error) {
          console.error("Error connecting to MetaMask", error);
          setError("Please connect to MetaMask");
        }
      } else {
        setError("Please install MetaMask extension");
      }
    };
    init();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        reportFile: e.target.files[0]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate form data
      if (!formData.reportFile) {
        throw new Error("Please select a file to upload");
      }

      if (!formData.patientAddress || !formData.doctorName) {
        throw new Error("Please fill in all required fields");
      }

      // Check IPFS connection before proceeding
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error("IPFS node is not accessible. Please check your connection.");
      }

      const web3 = new Web3(window.ethereum);
      const networkId = await web3.eth.net.getId();
      
      // Check if contract is deployed on the current network
      if (!DiagnosticForm.networks[networkId]) {
        throw new Error("Contract not deployed on current network");
      }

      const contract = new web3.eth.Contract(
        DiagnosticForm.abi,
        DiagnosticForm.networks[networkId].address
      );

      // Upload file to IPFS with error handling
      let cid;
      try {
        console.log('Starting file upload to IPFS...');
        const fileBuffer = await formData.reportFile.arrayBuffer();
        console.log('File buffer created, size:', fileBuffer.byteLength);
        
        const result = await ipfs.add(fileBuffer);
        cid = result.path;
        console.log("File uploaded to IPFS successfully. CID:", cid);
        
        // Verify the file is accessible through the gateway
        const gatewayUrl = `http://127.0.0.1:8080/ipfs/${cid}`;
        console.log('File should be accessible at:', gatewayUrl);
        
        // Verify the file is accessible through the API
        const testAccess = await ipfs.cat(cid);
        console.log('File verification successful');
      } catch (ipfsError) {
        console.error("IPFS upload error:", ipfsError);
        throw new Error("Failed to upload file to IPFS. Please check your IPFS node is running and accessible at http://127.0.0.1:5001");
      }

      // Create EHR record with detailed error handling
      try {
        console.log('Creating EHR record in smart contract...');
        await contract.methods.createEHR(
          formData.recordId,
          formData.doctorName,
          formData.patientName,
          parseInt(formData.age),
          formData.gender,
          formData.bloodGroup,
          formData.diagnosticAddress,
          formData.patientAddress,
          cid
        ).send({ 
          from: formData.diagnosticAddress,
          gas: 5000000 // Add explicit gas limit
        });

        console.log('EHR record created successfully');
        alert("Report created successfully!");
        navigate(`/diagnostic/${hhNumber}/dashboard`);
      } catch (contractError) {
        console.error("Contract interaction error:", contractError);
        throw new Error("Failed to create record in smart contract. Please check your transaction.");
      }
    } catch (err) {
      console.error("Error creating report:", err);
      setError(err.message || "Failed to create report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <NavBar_Logout />
      <div className="bg-gradient-to-b from-black to-gray-800 text-white min-h-screen p-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">Create Medical Report</h2>
          
          <div className={`p-3 rounded mb-4 ${ipfsStatus.includes('successful') ? 'bg-green-500' : 'bg-yellow-500'}`}>
            {ipfsStatus}
          </div>

          {error && (
            <div className="bg-red-500 text-white p-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2">Record ID</label>
                <input
                  type="text"
                  name="recordId"
                  value={formData.recordId}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-2">Doctor Name</label>
                <input
                  type="text"
                  name="doctorName"
                  value={formData.doctorName}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-2">Patient Name</label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-2">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 rounded"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block mb-2">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 rounded"
                  required
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="block mb-2">Patient Wallet Address</label>
                <input
                  type="text"
                  name="patientAddress"
                  value={formData.patientAddress}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-2">Upload Report</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full p-2 bg-gray-700 rounded"
                  required
                />
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-teal-500 text-white px-6 py-2 rounded hover:bg-teal-600 transition-colors disabled:bg-gray-500"
              >
                {loading ? "Creating..." : "Create Report"}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/diagnostic/${hhNumber}/dashboard`)}
                className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DiagnosticFormComponent;
