import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Table } from "react-daisyui";
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
                <Table>
                    <Table.Head>
                        <span>Name</span>
                        <span>Email</span>
                        <span>Grade</span>
                        <span>School</span>
                        <span>T Shirt Size</span>
                        <span>Technical Skill</span>
                        <span>Comments</span>
                        <span>Contact</span>
                        <span>Documents</span>
                        <span>Confirmation</span>
                        <span>Rejection</span>
                        <span>Rules</span>
                        <span>Release</span>
                        <span>Confirm</span>
                        <span>Reject</span>
                    </Table.Head>
                    <Table.Body>
                        {applicants.map((applicant) => (
                            <Table.Row key={applicant.email}>
                                <span>{applicant.name}</span>
                                <span>{applicant.email}</span>
                                <span>{applicant.grade}</span>
                                <span>{applicant.school}</span>
                                <span>{applicant.tShirtSize}</span>
                                <span>{applicant.technicalSkill}</span>
                                <span>{applicant.comments}</span>
                                <span>
                                    {applicant.status.contact.toString()}
                                </span>
                                <span>
                                    {applicant.status.documents.toString()}
                                </span>
                                <span>
                                    {applicant.status.confirmation.toString()}
                                </span>
                                <span>
                                    {applicant.status.rejected.toString()}
                                </span>
                                <span>
                                    <a
                                        target="_blank"
                                        rel="noreferrer"
                                        className={
                                            applicant.downloads.release === ""
                                                ? "hidden"
                                                : ""
                                        }
                                        href={applicant.downloads.rules}
                                    >
                                        rules
                                    </a>
                                </span>
                                <span>
                                    <a
                                        target="_blank"
                                        rel="noreferrer"
                                        href={applicant.downloads.release}
                                        className={
                                            applicant.downloads.release === ""
                                                ? "hidden"
                                                : ""
                                        }
                                    >
                                        release
                                    </a>
                                </span>
                                <span>
                                    <button
                                        className={`${
                                            applicant.status.documents
                                                ? ""
                                                : "hidden"
                                        } text-green-500`}
                                        onClick={() => confirm(applicant.id)}
                                    >
                                        Confirm
                                    </button>
                                </span>
                                <span>
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
                                </span>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </main>
        </div>
    );
};

export default Dashboard;
