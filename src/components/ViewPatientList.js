import React, { useState, useEffect } from "react";
import NavBar_Logout from "./NavBar_Logout";
import Web3 from "web3";
import PatientRegistration from "../build/contracts/PatientRegistration.json";

function ViewPatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        // Initialize Web3
        const web3 = new Web3(window.ethereum);
        const networkId = await web3.eth.net.getId();
        const contract = new web3.eth.Contract(
          PatientRegistration.abi,
          PatientRegistration.networks[networkId].address
        );

        // Get current account
        const accounts = await web3.eth.getAccounts();
        const currentAccount = accounts[0];

        // Since we don't have a direct method to get all patients, 
        // we'll need to use the events to get registered patients
        const events = await contract.getPastEvents('PatientRegistered', {
          fromBlock: 0,
          toBlock: 'latest'
        });

        // Fetch details for each patient
        const patientDetails = await Promise.all(
          events.map(async (event) => {
            const hhNumber = event.returnValues.hhNumber;
            try {
              const patient = await contract.methods.getPatientDetails(hhNumber).call();
              return {
                walletAddress: patient[0], // Using array indices as per contract return values
                name: patient[1],
                dateOfBirth: patient[2],
                gender: patient[3],
                bloodGroup: patient[4],
                homeAddress: patient[5],
                email: patient[6],
                hhNumber: hhNumber
              };
            } catch (error) {
              console.error(`Error fetching details for patient ${hhNumber}:`, error);
              return null;
            }
          })
        );

        // Filter out any null values from failed fetches
        const validPatients = patientDetails.filter(patient => patient !== null);
        setPatients(validPatients);
        setLoading(false);
      } catch (err) {
        console.error("Error loading patients:", err);
        setError("Failed to load patient list. Please make sure you are connected to the correct network.");
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  if (loading) {
    return (
      <div>
        <NavBar_Logout />
        <div className="bg-gradient-to-b from-black to-gray-800 text-white p-10 min-h-screen">
          <div className="text-center">Loading patient data...</div>
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
        <h2 className="text-3xl font-bold mb-6 text-center">Registered Patients</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">HH Number</th>
                <th className="px-6 py-3 text-left">Gender</th>
                <th className="px-6 py-3 text-left">Blood Group</th>
                <th className="px-6 py-3 text-left">Date of Birth</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Address</th>
                <th className="px-6 py-3 text-left">Wallet Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {patients.map((patient, index) => (
                <tr key={index} className="hover:bg-gray-800">
                  <td className="px-6 py-4">{patient.name}</td>
                  <td className="px-6 py-4">{patient.hhNumber}</td>
                  <td className="px-6 py-4">{patient.gender}</td>
                  <td className="px-6 py-4">{patient.bloodGroup}</td>
                  <td className="px-6 py-4">{patient.dateOfBirth}</td>
                  <td className="px-6 py-4">{patient.email}</td>
                  <td className="px-6 py-4">{patient.homeAddress}</td>
                  <td className="px-6 py-4 truncate max-w-xs">{patient.walletAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ViewPatientList;
