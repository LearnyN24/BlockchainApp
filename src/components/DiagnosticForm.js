import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar_Logout from "./NavBar_Logout";
import Web3 from "web3";
import DiagnosticForm from "../build/contracts/DiagnosticForm.json";
import { create } from 'ipfs-http-client';

function DiagnosticFormComponent() {
  const { hhNumber } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  // Configure IPFS client
  const ipfs = create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

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
    setFormData(prev => ({
      ...prev,
      reportFile: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const web3 = new Web3(window.ethereum);
      const networkId = await web3.eth.net.getId();
      const contract = new web3.eth.Contract(
        DiagnosticForm.abi,
        DiagnosticForm.networks[networkId].address
      );

      // Upload file to IPFS
      const fileBuffer = await formData.reportFile.arrayBuffer();
      const result = await ipfs.add(fileBuffer);
      const cid = result.path;

      // Create EHR record
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
      ).send({ from: formData.diagnosticAddress });

      alert("Report created successfully!");
      navigate(`/diagnostic/${hhNumber}/dashboard`);
    } catch (err) {
      console.error("Error creating report:", err);
      setError("Failed to create report. Please try again.");
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
