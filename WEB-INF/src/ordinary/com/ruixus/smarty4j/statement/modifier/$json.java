package com.ruixus.smarty4j.statement.modifier;

import org.lilystudio.coder.JSONEncoder;

import com.ruixus.smarty4j.statement.Modifier;

public class $json extends Modifier {

    public Object execute(Object obj) {
        return JSONEncoder.encode(obj);
    }
}
