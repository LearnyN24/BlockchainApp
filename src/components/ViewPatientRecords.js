import React, { useState, useEffect } from "react";
import NavBar_Logout from "./NavBar_Logout";
import Web3 from "web3";
import UploadEhr from "../build/contracts/UploadEhr.json";
import DiagnosticForm from "../build/contracts/DiagnosticForm.json";
import { useParams } from "react-router-dom";

function ViewPatientRecords() {
  const { hhNumber } = useParams();
  const [ehrRecords, setEhrRecords] = useState([]);
  const [diagnosticRecords, setDiagnosticRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientAddress, setPatientAddress] = useState(null);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        // Initialize Web3
        const web3 = new Web3(window.ethereum);
        const networkId = await web3.eth.net.getId();
        
        // Get patient's wallet address
        const accounts = await web3.eth.getAccounts();
        setPatientAddress(accounts[0]);

        // Initialize contracts
        const uploadEhrContract = new web3.eth.Contract(
          UploadEhr.abi,
          UploadEhr.networks[networkId].address
        );

        const diagnosticContract = new web3.eth.Contract(
          DiagnosticForm.abi,
          DiagnosticForm.networks[networkId].address
        );

        // Get records from both contracts
        const [ehrResults, diagnosticResults] = await Promise.all([
          uploadEhrContract.methods.getRecords().call(),
          diagnosticContract.methods.getRecords().call()
        ]);

        // Filter diagnostic records for the current patient
        const patientDiagnosticRecords = diagnosticResults.filter(
          record => record.patientAddress.toLowerCase() === accounts[0].toLowerCase()
        );

        setEhrRecords(ehrResults);
        setDiagnosticRecords(patientDiagnosticRecords);
        setLoading(false);
      } catch (err) {
        console.error("Error loading records:", err);
        setError("Failed to load medical records. Please make sure you are connected to the correct network.");
        setLoading(false);
      }
    };

    loadRecords();
  }, []);

  if (loading) {
    return (
      <div>
        <NavBar_Logout />
        <div className="bg-gradient-to-b from-black to-gray-800 text-white p-10 min-h-screen">
          <div className="text-center">Loading medical records...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <NavBar_Logout />
        <div className="bg-gradient-to-b from-black to-gray-800 text-white p-10 min-h-screen">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavBar_Logout />
      <div className="bg-gradient-to-b from-black to-gray-800 text-white p-10 min-h-screen">
        <h2 className="text-3xl font-bold mb-6 text-center">Medical Records</h2>
        
        {ehrRecords.length === 0 && diagnosticRecords.length === 0 ? (
          <div className="text-center text-gray-400">
            No medical records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">Timestamp</th>
                  <th className="px-6 py-3 text-left">Record Hash</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {ehrRecords.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-800">
                    <td className="px-6 py-4">{record.timeStamp}</td>
                    <td className="px-6 py-4 truncate max-w-xs">
                      {record.medicalRecordHash}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => window.open(`https://ipfs.io/ipfs/${record.medicalRecordHash}`, '_blank')}
                        className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 transition-colors"
                      >
                        View Document
                      </button>
                    </td>
                  </tr>
                ))}
                {diagnosticRecords.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-800">
                    <td className="px-6 py-4">{record.timeStamp}</td>
                    <td className="px-6 py-4 truncate max-w-xs">
                      {record.medicalRecordHash}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => window.open(`https://ipfs.io/ipfs/${record.medicalRecordHash}`, '_blank')}
                        className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 transition-colors"
                      >
                        View Document
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Diagnostic Records Section */}
        <div>
          <h3 className="text-2xl font-semibold mb-4">Diagnostic Reports</h3>
          {diagnosticRecords.length === 0 ? (
            <div className="text-center text-gray-400">
              No diagnostic reports found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left">Record ID</th>
                    <th className="px-6 py-3 text-left">Doctor</th>
                    <th className="px-6 py-3 text-left">Diagnostic Center</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {diagnosticRecords.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-800">
                      <td className="px-6 py-4">{record.recordId}</td>
                      <td className="px-6 py-4">{record.doctorName}</td>
                      <td className="px-6 py-4">{record.diagnosticAddress}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => window.open(`https://ipfs.io/ipfs/${record.cid}`, '_blank')}
                          className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 transition-colors"
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewPatientRecords;
