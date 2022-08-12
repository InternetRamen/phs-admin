import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import {
    collection,
    DocumentData,
    getDoc,
    getDocs,
    getFirestore,
    QueryDocumentSnapshot,
    doc,
    setDoc,
} from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import {
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
} from "@chakra-ui/react";
const Dashboard = () => {
    const firebaseConfig = {
        apiKey: "AIzaSyBrCUdCf4V6XFOUoLrp2unufCJaidoKYlA",
        authDomain: "poolesvillehacks1.firebaseapp.com",
        projectId: "poolesvillehacks1",
        storageBucket: "poolesvillehacks1.appspot.com",
        messagingSenderId: "376208034987",
        appId: "1:376208034987:web:84fc7ac43746b2dd013bee",
        measurementId: "G-QNQ6BJ0ZY7",
    };
    const app = initializeApp(firebaseConfig);
    const [user, setUser] = useState<User>();
    const router = useRouter();
    const auth = getAuth();
    const [applicants, setApplicants] = useState<any[]>([]);
    useEffect(() => {
        onAuthStateChanged(auth, async (check) => {
            if (check) {
                setUser(check);
            } else {
                router.push("/");
            }
        });
        if (user) {
            console.log(user.uid);
            getData();
        }
    }, [user]);
    const db = getFirestore(app);
    const getData = async () => {
        let snap = await getDocs(collection(db, "users"));
        for (let doc of snap.docs) {
            const d = doc.data();
            const obj = {
                rules: await getDownloadURLfromPath(
                    `user_documents/${d.name}/${d.name
                        .toLowerCase()
                        .replace(" ", "")}_${doc.id}_rules.pdf`
                ),
                release: await getDownloadURLfromPath(
                    `user_documents/${d.name}/${d.name
                        .toLowerCase()
                        .replace(" ", "")}_${doc.id}_release.pdf`
                ),
            };

            d.downloads = obj;
            d.id = doc.id;
            setApplicants((a) => [...a, d]);
        }
    };

    const [page, setPage] = useState("applicants");
    const storage = getStorage(app);
    const getDownloadURLfromPath = async (path: string) => {
        return await getDownloadURL(ref(storage, path)).catch((err) => {
            return "";
            console.error(err);
        });
    };
    const confirm = async (id: string) => {
        await setDoc(
            doc(db, "users", id),
            {
                status: {
                    confirmed: true,
                },
            },
            { merge: true }
        );
    };
    const reject = async (id: string) => {
        setApplicants((a) => {
            return a.map((item) => {
                return item.id === id
                    ? {
                          ...item,
                          status: {
                              rejected: true,
                              contact: false,
                              documents: false,
                              confirmation: false,
                          },
                      }
                    : item;
            });
        });
        await setDoc(
            doc(db, "users", id),
            {
                status: {
                    rejected: true,
                    contact: false,
                    documents: false,
                },
            },
            { merge: true }
        );
    };
    return (
        <div>
            <nav className="flex gap-2 fixed top-0 z-10">
                <h1>Applicants</h1>
                <h1>Scanner</h1>
            </nav>
            <main className="mt-40 mx-20">
                <TableContainer>
                    <Table>
                        <Thead>
                            <Tr>
                                <Th>Name</Th>
                                <Th>Email</Th>
                                <Th>Grade</Th>
                                <Th>School</Th>
                                <Th>T Shirt Size</Th>
                                <Th>Technical Skill</Th>
                                <Th>Comments</Th>
                                <Th>Contact</Th>
                                <Th>Documents</Th>
                                <Th>Confirmation</Th>
                                <Th>Rejection</Th>
                                <Th>Rules</Th>
                                <Th>Release</Th>
                                <Th>Confirm</Th>
                                <Th>Reject</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {applicants.map((applicant) => (
                                <Tr key={applicant.email}>
                                    <Td>{applicant.name}</Td>
                                    <Td>{applicant.email}</Td>
                                    <Td>{applicant.grade}</Td>
                                    <Td>{applicant.school}</Td>
                                    <Td>{applicant.tShirtSize}</Td>
                                    <Td>{applicant.technicalSkill}</Td>
                                    <Td>{applicant.comments}</Td>
                                    <Td>
                                        {applicant.status.contact.toString()}
                                    </Td>
                                    <Td>
                                        {applicant.status.documents.toString()}
                                    </Td>
                                    <Td>
                                        {applicant.status.confirmation.toString()}
                                    </Td>
                                    <Td>
                                        {applicant.status.rejected.toString()}
                                    </Td>
                                    <Td>
                                        <a
                                            target="_blank"
                                            rel="noreferrer"
                                            className={
                                                applicant.downloads.release ===
                                                ""
                                                    ? "hidden"
                                                    : ""
                                            }
                                            href={applicant.downloads.rules}
                                        >
                                            rules
                                        </a>
                                    </Td>
                                    <Td>
                                        <a
                                            target="_blank"
                                            rel="noreferrer"
                                            href={applicant.downloads.release}
                                            className={
                                                applicant.downloads.release ===
                                                ""
                                                    ? "hidden"
                                                    : ""
                                            }
                                        >
                                            release
                                        </a>
                                    </Td>
                                    <Td>
                                        <button
                                            className={`${
                                                applicant.status.documents
                                                    ? ""
                                                    : "hidden"
                                            } text-green-500`}
                                            onClick={() =>
                                                confirm(applicant.id)
                                            }
                                        >
                                            Confirm
                                        </button>
                                    </Td>
                                    <Td>
                                        <button
                                            className={`${
                                                applicant.status.documents
                                                    ? ""
                                                    : "hidden"
                                            } text-red-500`}
                                            onClick={() => reject(applicant.id)}
                                        >
                                            Reject
                                        </button>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </TableContainer>
            </main>
        </div>
    );
};

export default Dashboard;
