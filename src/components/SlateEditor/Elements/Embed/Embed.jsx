import React, {useRef, useState} from "react";
import Button from "../../common/Button";
import Icon from "../../common/Icon";
import {isBlockActive} from "../../utils/SlateUtilityFunctions";
import usePopup from "../../utils/usePopup";
import {insertEmbed} from "../../utils/embed.js";

const Embed = ({editor, format}) => {
    const urlInputRef = useRef();
    const [showInput, setShowInput] = usePopup(urlInputRef);
    const [formData, setFormData] = useState({
        url: "",
        width: "",
        height: "",
        src: null
    });
    const handleButtonClick = (e) => {
        setFormData({
            url: "",
            width: "",
            height: "",
            src: null
        });
        e.preventDefault();
        setShowInput((prev) => !prev);
    };
    const handleFormSubmit = (e) => {
        e.preventDefault();
        insertEmbed(editor, {...formData}, format);
        setShowInput(false);
        setFormData({
            url: "",
            width: "",
            height: "",
            src: null
        });
    };

    return (
        <div ref={urlInputRef} className="popup-wrapper">
            <Button
                active={isBlockActive(editor, format)}
                style={{
                    border: showInput ? "1px solid lightgray" : "",
                    borderBottom: "none"
                }}
                format={format}
                onClick={handleButtonClick}
            >
                <Icon icon={format}/>
            </Button>
            {showInput && (
                <div className="popup">
                    <h5>Insert Image Via Link</h5>
                    <form onSubmit={handleFormSubmit}>
                        <input
                            type="text"
                            default="200px"
                            placeholder="Enter url"
                            value={formData.url}
                            onChange={(e) =>
                                setFormData((prev) => ({...prev, url: e.target.value}))
                            }
                        />
                        <input
                            type="text"
                            default="200px"
                            placeholder="Enter width of frame"
                            value={formData.width}
                            onChange={(e) =>
                                setFormData((prev) => ({...prev, width: e.target.value}))
                            }
                        />
                        <input
                            type="text"
                            default="200px"
                            placeholder="Enter height of frame"
                            value={formData.height}
                            onChange={(e) => {
                                setFormData((prev) => ({...prev, height: e.target.value}));
                            }}
                        />

                        <hr/>

                        <div>
                            <h5>Image Uploader</h5>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files[0];

                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (e) => {
                                            setFormData((prev) => ({...prev, src: e.target.result}));
                                        };
                                        reader.readAsDataURL(file);
                                    }

                                }}
                            />
                        </div>
                        {formData.src ? <p>Upload Done ! <Button type="submit">Save</Button></p> : <div></div>}
                    </form>
                </div>
            )}
        </div>
    );
};

export default Embed;
